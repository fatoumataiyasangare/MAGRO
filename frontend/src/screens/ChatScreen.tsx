import { useState, useEffect } from "react";
import { ArrowLeft, Send, Search, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { fetchConversations, fetchMessages, createConversation, sendMessage, ConversationItem, MessageItem } from "../services/chat";
import { getInitials } from "../utils/format";

interface ChatScreenMVPProps {
  onBack: () => void;
  contactName?: string;
  contactId?: string;
}

export default function ChatScreenMVP({ onBack, contactName, contactId }: ChatScreenMVPProps) {
  const [view, setView] = useState<"list" | "conversation">(contactId || contactName ? "conversation" : "list");
  const [activeConversation, setActiveConversation] = useState<ConversationItem | null>(null);
  const [message, setMessage] = useState("");
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [aliases, setAliases] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem("magro_chat_aliases") || "{}");
    } catch {
      return {};
    }
  });

  const getAlias = (id: string, defaultName: string) => aliases[id] || defaultName;

  const handleRename = () => {
    if (!activeConversation) return;
    const currentName = getAlias(activeConversation.otherUser.id, activeConversation.otherUser.name);
    const newName = prompt("Donnez un nom personnalisé à ce contact :", currentName);
    if (newName && newName.trim() !== "") {
      const newAliases = { ...aliases, [activeConversation.otherUser.id]: newName.trim() };
      setAliases(newAliases);
      localStorage.setItem("magro_chat_aliases", JSON.stringify(newAliases));
    }
  };

  // Load conversations and optionally handle contactName redirect
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const convs = await fetchConversations();
        setConversations(convs);

        if (contactId) {
          const existing = convs.find(c => c.otherUser.id === contactId);
          if (existing) {
            setActiveConversation(existing);
            setView("conversation");
          } else {
            try {
              const newConv = await createConversation(contactId);
              setConversations(prev => [newConv, ...prev]);
              setActiveConversation(newConv);
              setView("conversation");
            } catch (err) {
              console.error("Error creating matching conversation:", err);
            }
          }
        }
      } catch (err) {
        console.error("Error loading conversations:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [contactId, contactName]);

  // Load messages for active conversation and poll for updates
  useEffect(() => {
    if (!activeConversation) return;

    async function loadMessages() {
      try {
        const msgs = await fetchMessages(activeConversation.id);
        setMessages(msgs);
      } catch (err) {
        console.error("Error loading messages:", err);
      }
    }

    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [activeConversation]);

  const handleSend = async () => {
    if (message.trim() && activeConversation) {
      const currentMsg = message;
      setMessage("");
      try {
        const newMsg = await sendMessage(activeConversation.id, currentMsg);
        setMessages(prev => [...prev, newMsg]);
        setConversations(prev => prev.map(c => 
          c.id === activeConversation.id 
            ? { ...c, lastMessage: currentMsg, lastMessageAt: new Date().toISOString() } 
            : c
        ));
      } catch (err) {
        console.error("Error sending message:", err);
      }
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen bg-muted flex flex-col pb-20">
      <AnimatePresence mode="wait">
        {view === "list" ? (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full">
            {/* Contact List Header */}
            <div className="bg-white border-b border-border px-6 pt-8 pb-4">
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={onBack}
                  className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher une conversation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-muted border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            </div>

            {/* Contacts */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Chargement des conversations...</div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Aucune conversation trouvée</div>
              ) : (
                <div className="space-y-2 mt-2">
                  {filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => {
                        setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c));
                        setActiveConversation({ ...conv, unreadCount: 0 });
                        setView("conversation");
                      }}
                      className="w-full bg-white p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors border border-border/50 text-left animate-fade-in"
                    >
                      <div className="relative">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-lg overflow-hidden">
                          {conv.otherUser.avatarUrl ? (
                            <img src={conv.otherUser.avatarUrl} alt={conv.otherUser.name} className="w-full h-full object-cover" />
                          ) : (
                            getInitials(conv.otherUser.name)
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex flex-col items-start truncate">
                            <h3 className="font-bold text-gray-900 truncate">{getAlias(conv.otherUser.id, conv.otherUser.name)}</h3>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {new Date(conv.lastMessageAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className={`text-sm truncate ${conv.unreadCount > 0 ? "text-gray-900 font-semibold" : "text-muted-foreground"}`}>
                            {conv.lastMessage}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="ml-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="conversation" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="flex flex-col h-full bg-muted z-10 absolute inset-0">
            {/* Conversation Header */}
            <div className="bg-white border-b border-border px-6 py-4 pt-6">
              <div className="flex items-center gap-4">
                <button onClick={() => setView("list")} className="cursor-pointer p-2 -ml-2 rounded-full hover:bg-muted">
                  <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold overflow-hidden">
                    {activeConversation?.otherUser.avatarUrl ? (
                      <img src={activeConversation.otherUser.avatarUrl} alt={activeConversation.otherUser.name} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(activeConversation?.otherUser.name)
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-gray-900">
                      {activeConversation ? getAlias(activeConversation.otherUser.id, activeConversation.otherUser.name) : ""}
                    </h2>
                    <button onClick={handleRename} className="p-1 text-gray-400 hover:text-primary rounded-full hover:bg-gray-100" title="Renommer">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4 pb-4">
                {messages.map((msg, index) => {
                  const isMe = msg.senderId === "me" || msg.senderId !== activeConversation?.otherUser.id;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.05, 0.3) }}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                          isMe
                            ? "bg-secondary text-white rounded-br-sm"
                            : "bg-white text-gray-800 rounded-bl-sm border border-gray-100 shadow-sm"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <p
                          className={`text-[10px] mt-1 text-right ${
                            isMe ? "text-white/70" : "text-muted-foreground"
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Input */}
            <div className="bg-white border-t border-border px-4 py-3">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Écrire un message..."
                  className="flex-1 px-4 py-3 bg-muted rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm hover:bg-primary/90 transition-colors"
                >
                  <Send className="w-5 h-5 -ml-1" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
