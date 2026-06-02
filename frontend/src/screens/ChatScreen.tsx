import { useState } from "react";
import { ArrowLeft, Send, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChatScreenMVPProps {
  onBack: () => void;
  contactName?: string;
}

interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  timestamp: string;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
}

export default function ChatScreenMVP({ onBack, contactName }: ChatScreenMVPProps) {
  // View state: 'list' or 'conversation'
  const [view, setView] = useState<"list" | "conversation">(contactName ? "conversation" : "list");
  const [activeContact, setActiveContact] = useState<string>(contactName || "Amadou Traoré");
  const [message, setMessage] = useState("");

  const [contactsList, setContactsList] = useState<Contact[]>([
    { id: "1", name: "Amadou Traoré", role: "Agriculteur", lastMessage: "Oui, j'ai 500 kg disponibles.", time: "10:32", unreadCount: 2 },
    { id: "2", name: "Fatoumata Keita", role: "Agriculteur", lastMessage: "Merci pour la commande.", time: "Hier", unreadCount: 0 },
    { id: "3", name: "Modérateur MAGRO", role: "Support", lastMessage: "Votre badge vert est validé.", time: "Lun", unreadCount: 1 },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Bonjour, je suis intéressé par vos tomates", sender: "me", timestamp: "10:30" },
    { id: "2", text: "Bonjour ! Oui, j'ai 500 kg de tomates fraîches disponibles", sender: "other", timestamp: "10:32" },
  ]);

  const handleSend = () => {
    if (message.trim()) {
      setMessages([
        ...messages,
        {
          id: Date.now().toString(),
          text: message,
          sender: "me",
          timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        }
      ]);
      setMessage("");
    }
  };

  const openConversation = (name: string) => {
    setContactsList(prev => prev.map(c => c.name === name ? { ...c, unreadCount: 0 } : c));
    setActiveContact(name);
    setView("conversation");
  };

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
                  className="w-full pl-10 pr-4 py-2.5 bg-muted border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            </div>

            {/* Contacts */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
              <div className="space-y-2 mt-2">
                {contactsList.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => openConversation(contact.name)}
                    className="w-full bg-white p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors border border-border/50 text-left"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                        {contact.name.charAt(0)}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-bold text-gray-900 truncate">{contact.name}</h3>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{contact.time}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className={`text-sm truncate ${contact.unreadCount > 0 ? "text-gray-900 font-semibold" : "text-muted-foreground"}`}>
                          {contact.lastMessage}
                        </p>
                        {contact.unreadCount > 0 && (
                          <span className="ml-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {contact.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
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
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                    {activeContact.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">{activeContact}</h2>
                    <p className="text-xs text-green-600 font-medium">En ligne</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4 pb-4">
                {messages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                        msg.sender === "me"
                          ? "bg-secondary text-white rounded-br-sm"
                          : "bg-white text-gray-800 rounded-bl-sm border border-gray-100 shadow-sm"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <p
                        className={`text-[10px] mt-1 text-right ${
                          msg.sender === "me" ? "text-white/70" : "text-muted-foreground"
                        }`}
                      >
                        {msg.timestamp}
                      </p>
                    </div>
                  </motion.div>
                ))}
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
