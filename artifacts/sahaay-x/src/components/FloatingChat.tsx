import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, User as UserIcon, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateGeminiConversation } from "@workspace/api-client-react";

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [convId, setConvId] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const { token } = useAuth();
  const createConv = useCreateGeminiConversation();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && !convId && token) {
      createConv.mutate({ data: { title: "SahaayX Chat" } }, {
        onSuccess: (data) => {
          setConvId(data.id);
          setMessages([{
            role: "assistant",
            content: "Hello! I am SahaayX Assistant. How can I help with volunteer coordination or disaster relief today?",
          }]);
        },
      });
    }
  }, [isOpen, convId, token]);

  const handleSend = async () => {
    if (!input.trim() || !convId || !token || isTyping) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsTyping(true);
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch(`/api/gemini/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: userMsg }),
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value);
          for (const line of text.split("\n").filter(l => l.startsWith("data: "))) {
            try {
              const d = JSON.parse(line.slice(6));
              if (d.content) {
                fullText += d.content;
                setMessages(prev => {
                  const msgs = [...prev];
                  msgs[msgs.length - 1] = { role: "assistant", content: fullText };
                  return msgs;
                });
              }
            } catch {}
          }
        }
      }
    } catch {
      setMessages(prev => {
        const msgs = [...prev];
        msgs[msgs.length - 1] = { role: "assistant", content: "Sorry, something went wrong." };
        return msgs;
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg gold-glow p-0 flex items-center justify-center relative"
          >
            <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
            <MessageSquare className="w-5 h-5 text-primary-foreground" />
          </Button>
        </div>
      )}

      {isOpen && (
        <div className="fixed bottom-5 right-5 w-[360px] h-[480px] glass-card flex flex-col z-50 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 border border-primary/20">
          {/* Header */}
          <div className="h-12 bg-primary/15 border-b border-primary/20 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="font-medium text-sm">SahaayX</span>
              <span className="text-[10px] text-primary/60 font-mono">· Gemini AI</span>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary/10" onClick={() => setIsOpen(false)}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center mt-0.5 ${
                  m.role === "user" ? "bg-primary/20" : "bg-muted"
                }`}>
                  {m.role === "user"
                    ? <UserIcon className="w-3 h-3 text-primary" />
                    : <Bot className="w-3 h-3 text-primary" />
                  }
                </div>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted text-foreground rounded-tl-sm border border-border/50"
                }`}>
                  {m.content || <span className="opacity-50 animate-pulse">typing...</span>}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border/50 bg-background/30">
            <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about missions, volunteers..."
                className="bg-background border-border text-sm h-9"
                disabled={isTyping}
              />
              <Button type="submit" size="icon" className="h-9 w-9 bg-primary hover:bg-primary/90 shrink-0" disabled={!input.trim() || isTyping}>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
