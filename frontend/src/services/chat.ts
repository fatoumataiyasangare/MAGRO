import { apiFetch } from "./api";

export interface ConversationItem {
  id: string;
  otherUser: {
    id: string;
    name: string;
    role: string;
    phone?: string;
    avatarUrl?: string | null;
  };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface MessageItem {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt?: string | null;
}

export async function fetchConversations(): Promise<ConversationItem[]> {
  return await apiFetch<ConversationItem[]>("/chat/conversations");
}

export async function fetchMessages(conversationId: string): Promise<MessageItem[]> {
  return await apiFetch<MessageItem[]>(`/chat/conversations/${conversationId}/messages`);
}

export async function createConversation(recipientId: string): Promise<ConversationItem> {
  const result = await apiFetch<any>("/chat/conversations", {
    method: "POST",
    body: JSON.stringify({ otherUserId: recipientId }),
  });

  const isP1 = result.participant1Id === recipientId;
  const otherUser = isP1 ? result.participant1 : result.participant2;

  return {
    id: result.id,
    otherUser,
    lastMessage: "Aucun message",
    lastMessageAt: result.createdAt,
    unreadCount: 0,
  };
}

export async function sendMessage(conversationId: string, content: string): Promise<MessageItem> {
  return await apiFetch<MessageItem>(`/chat/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export async function fetchUnreadCount(): Promise<{ unreadCount: number }> {
  return await apiFetch<{ unreadCount: number }>("/chat/unread-count");
}

import { useState, useEffect } from "react";
import { getStoredAccessToken } from "./api";

export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const fetchCount = async () => {
      // Don't attempt if no access token is stored (user not logged in)
      if (!getStoredAccessToken()) return;
      try {
        const data = await fetchUnreadCount();
        if (mounted) setUnreadCount(data.unreadCount);
      } catch (err) {
        // Silently ignore 401 errors — expected when session expires
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 10000); // refresh every 10 seconds
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return unreadCount;
}

