import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateGeminiConversation } from "@workspace/api-client-react";

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [convId, setConvId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { token } = useAuth();
  const createConv = useCreateGeminiConversation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && !convId) {
      // Create initial conversation
      createConv.mutate({ data: { title: "SahaayX Chat" } }, {
        onSuccess: (data) => {
          setConvId(data.id);
          setMessages([{ role: "assistant", content: "Hello! I am SahaayX Assistant, an intelligent guide for India's volunteer coordination platform. How can I assist you with social impact or disaster relief coordination today?" }]);
        }
      });
    }
  }, [isOpen, convId]);

  const handleSend = async () => {
    if (!input.trim() || !convId || !token) return;
    
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsTyping(true);

    try {
      const response = await fetch(`/api/gemini/conversations/${convId}/messages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ content: userMsg }),
      });
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      let assistantMsg = "";
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value);
          const lines = text.split('\n').filter(l => l.startsWith('data: '));
          for (const line of lines) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                assistantMsg += data.content;
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].content = assistantMsg;
                  return newMsgs;
                });
              }
            } catch {}
          }
        }
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error connecting to the server." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <Button 
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-[#00B4D8] shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all p-0 flex items-center justify-center relative group"
          >
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping group-hover:animate-none"></div>
            <Bot className="w-7 h-7 text-white" />
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[380px] h-[500px] glass-card flex flex-col z-50 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-5">
          <div className="h-14 bg-gradient-to-r from-primary/90 to-primary/70 backdrop-blur-md flex items-center justify-between px-4 text-primary-foreground border-b border-white/10">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-medium text-sm">SahaayX Assistant <span className="opacity-70 text-xs ml-1">· Gemini</span></span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-white/20 rounded-full" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${m.role === 'user' ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'}`}>
                  {m.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-secondary/10 border border-secondary/20 text-foreground rounded-tr-sm' : 'bg-muted/50 border border-border text-foreground rounded-tl-sm'}`}>
                  {m.content || <span className="animate-pulse">...</span>}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-border bg-card/50">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2 relative">
              <Input 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask SahaayX Assistant..." 
                className="pr-10 bg-background/50 border-white/10 focus-visible:ring-primary/50"
                disabled={isTyping}
              />
              <Button 
                type="submit" 
                size="icon" 
                className="absolute right-1 top-1 h-8 w-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md"
                disabled={!input.trim() || isTyping}
              >
                <Send className="w-4 h-4 ml-0.5" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
