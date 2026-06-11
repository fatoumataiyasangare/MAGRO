import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

// GET /chat/conversations
router.get("/conversations", requireAuth, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  
  const convs = await prisma.conversation.findMany({
    where: {
      OR: [
        { participant1Id: userId },
        { participant2Id: userId }
      ]
    },
    include: {
      participant1: { select: { id: true, name: true, phone: true, avatarUrl: true, role: true } },
      participant2: { select: { id: true, name: true, phone: true, avatarUrl: true, role: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    },
    orderBy: { lastMessageAt: "desc" }
  });

  const formatted = await Promise.all(convs.map(async conv => {
    const isP1 = conv.participant1Id === userId;
    const otherUser = isP1 ? conv.participant2 : conv.participant1;
    const lastMsg = conv.messages[0];

    const unreadCount = await prisma.message.count({
      where: {
        conversationId: conv.id,
        senderId: { not: userId },
        readAt: null
      }
    });

    return {
      id: conv.id,
      otherUser,
      lastMessage: lastMsg?.content || "",
      lastMessageAt: lastMsg?.createdAt || conv.createdAt,
      unreadCount
    };
  }));

  res.json(formatted);
}));

// POST /chat/conversations
const createConvSchema = z.object({ otherUserId: z.string().uuid() });
router.post("/conversations", requireAuth, asyncHandler(async (req: AuthRequest, res) => {
  const parseResult = createConvSchema.safeParse(req.body);
  if (!parseResult.success) return res.status(400).json({ error: "Invalid payload" });
  
  const { otherUserId } = parseResult.data;
  const userId = req.user!.id;

  if (userId === otherUserId) {
    return res.status(400).json({ error: "Cannot chat with yourself" });
  }

  // Ensure consistent order for unique constraint
  const p1 = userId < otherUserId ? userId : otherUserId;
  const p2 = userId < otherUserId ? otherUserId : userId;

  let conv = await prisma.conversation.findUnique({
    where: {
      participant1Id_participant2Id: { participant1Id: p1, participant2Id: p2 }
    },
    include: {
      participant1: { select: { id: true, name: true, phone: true, avatarUrl: true, role: true } },
      participant2: { select: { id: true, name: true, phone: true, avatarUrl: true, role: true } }
    }
  });

  if (!conv) {
    conv = await prisma.conversation.create({
      data: {
        participant1Id: p1,
        participant2Id: p2
      },
      include: {
        participant1: { select: { id: true, name: true, phone: true, avatarUrl: true, role: true } },
        participant2: { select: { id: true, name: true, phone: true, avatarUrl: true, role: true } }
      }
    });
  }

  res.status(201).json(conv);
}));

// GET /chat/conversations/:id/messages
router.get("/conversations/:id/messages", requireAuth, asyncHandler(async (req: AuthRequest, res) => {
  const convId = req.params.id;
  const userId = req.user!.id;

  const conv = await prisma.conversation.findUnique({ where: { id: convId } });
  if (!conv) return res.status(404).json({ error: "Not found" });
  
  if (conv.participant1Id !== userId && conv.participant2Id !== userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // Mark all messages from the other user as read
  await prisma.message.updateMany({
    where: {
      conversationId: convId,
      senderId: { not: userId },
      readAt: null
    },
    data: {
      readAt: new Date()
    }
  });

  const messages = await prisma.message.findMany({
    where: { conversationId: convId },
    orderBy: { createdAt: "asc" }
  });

  const formatted = messages.map(m => ({
    id: m.id,
    content: m.content,
    senderId: m.senderId,
    createdAt: m.createdAt,
    isMine: m.senderId === userId
  }));

  res.json(formatted);
}));

// POST /chat/conversations/:id/messages
const sendMessageSchema = z.object({ content: z.string().min(1) });
router.post("/conversations/:id/messages", requireAuth, asyncHandler(async (req: AuthRequest, res) => {
  const convId = req.params.id;
  const userId = req.user!.id;
  
  const parseResult = sendMessageSchema.safeParse(req.body);
  if (!parseResult.success) return res.status(400).json({ error: "Invalid payload" });

  const content = parseResult.data.content;

  // Anti-bypass regex: detect phone numbers or keywords
  // Looks for 7+ digits (possibly with spaces/dashes) or words like num, numero, whatsapp
  const phonePattern = /(?:\+?223|00223)?[\s-]?[5-9][\s-]?\d[\s-]?\d[\s-]?\d[\s-]?\d[\s-]?\d[\s-]?\d[\s-]?\d/;
  const numberLikePattern = /\d{2}[\s-]?\d{2}[\s-]?\d{2}[\s-]?\d{2}/;
  const keywordsPattern = /\b(num[eé]?ro|num|whatsapp|contacte[- ]moi)\b/i;

  if (phonePattern.test(content) || numberLikePattern.test(content) || keywordsPattern.test(content)) {
    return res.status(400).json({ 
      error: "Le partage de numéros de téléphone ou de contacts externes est strictement interdit sur la plateforme." 
    });
  }

  const conv = await prisma.conversation.findUnique({ where: { id: convId } });
  if (!conv) return res.status(404).json({ error: "Not found" });
  if (conv.participant1Id !== userId && conv.participant2Id !== userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const msg = await prisma.message.create({
    data: {
      conversationId: convId,
      senderId: userId,
      content: parseResult.data.content
    }
  });

  await prisma.conversation.update({
    where: { id: convId },
    data: { lastMessageAt: new Date() }
  });

  res.status(201).json({
    id: msg.id,
    content: msg.content,
    senderId: msg.senderId,
    createdAt: msg.createdAt,
    isMine: true
  });
}));

// GET /chat/unread-count
router.get("/unread-count", requireAuth, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const unreadCount = await prisma.message.count({
    where: {
      conversation: {
        OR: [{ participant1Id: userId }, { participant2Id: userId }]
      },
      senderId: { not: userId },
      readAt: null
    }
  });
  res.json({ unreadCount });
}));

export default router;
