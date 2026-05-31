import { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { motion } from "motion/react";

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

export default function ChatScreenMVP({ onBack, contactName = "Amadou Traoré" }: ChatScreenMVPProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Bonjour, je suis intéressé par vos tomates",
      sender: "me",
      timestamp: "10:30"
    },
    {
      id: "2",
      text: "Bonjour ! Oui, j'ai 500 kg de tomates fraîches disponibles",
      sender: "other",
      timestamp: "10:32"
    },
    {
      id: "3",
      text: "Parfait, je voudrais en commander 50 kg",
      sender: "me",
      timestamp: "10:33"
    }
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

  return (
    <div className="h-screen bg-muted flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
              {contactName.charAt(0)}
            </div>
            <div>
              <h2 className="text-base">{contactName}</h2>
              <p className="text-xs text-muted-foreground">En ligne</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-4">
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
                    : "bg-white rounded-bl-sm"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p
                  className={`text-xs mt-1 ${
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
      <div className="bg-white border-t border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Écrire un message..."
            className="flex-1 px-4 py-3 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="w-12 h-12 bg-secondary text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
