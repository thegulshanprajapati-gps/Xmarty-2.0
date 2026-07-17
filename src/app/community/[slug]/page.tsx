'use client';

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Loader2, Users, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function CommunityChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  
  const slug = params?.slug as string;

  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [roomName, setRoomName] = useState("");

  const chatBottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`/api/community/chat?slug=${slug}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
        if (data.community && data.community.name) {
          setRoomName(data.community.name);
        }
      }
    } catch (e) {
      console.error("Failed to load chat messages:", e);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Set initial fallback room name from slug while loading
  useEffect(() => {
    if (slug && !roomName) {
      const name = slug
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      setRoomName(name);
    }
  }, [slug, roomName]);

  // Auth guard and initial load
  useEffect(() => {
    if (!userLoading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(`/community/${slug}`)}`);
    } else if (user && slug) {
      fetchMessages(true);
      const interval = setInterval(() => fetchMessages(false), 3000); // Poll messages every 3s
      return () => clearInterval(interval);
    }
  }, [user, userLoading, slug, router]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const msgText = newMessage.trim();
    setNewMessage("");

    try {
      const res = await fetch("/api/community/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          message: msgText
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, data.message]);
      } else {
        alert(data.error || "Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (email: string) => {
    const hash = email.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      "bg-primary text-primary-foreground",
      "bg-indigo-500 text-white",
      "bg-emerald-500 text-white",
      "bg-pink-500 text-white",
      "bg-amber-500 text-white",
      "bg-sky-500 text-white"
    ];
    return colors[hash % colors.length];
  };

  if (userLoading || !user) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-[#FAFCFF] dark:bg-[#030712] relative overflow-hidden">
        {/* Soft atmospheric background lights */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none animate-pulse" style={{ animationDelay: '1.5s' }} />
        
        {/* Custom premium loader graphic: double ring orbiting layout */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[3px] border-primary/10 border-t-primary animate-spin" />
          <div className="absolute inset-2 rounded-full border-[3px] border-indigo-500/5 border-b-indigo-500/40 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary/20 to-indigo-500/20 backdrop-blur-md border border-white/20 dark:border-white/5 animate-pulse" />
        </div>
        
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-6 tracking-wide">
          Entering Chat Space
        </h3>
        <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1.5 animate-pulse">
          Synchronizing secure channel...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FAFCFF] dark:bg-[#030712] text-slate-900 dark:text-slate-100 transition-colors duration-300 flex flex-col">
      
      {/* Ambient background light */}
      <div className="absolute inset-x-0 top-0 h-[250px] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/3 w-[300px] h-[200px] bg-primary/5 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-4xl w-full mx-auto px-4 py-6 relative z-10 flex-1 flex flex-col h-[calc(100vh-80px)]">
        
        {/* Chat Room Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4 shrink-0 bg-[#FAFCFF]/85 dark:bg-[#030712]/85 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-900">
              <Link href="/community/hub">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                  {roomName}
                </h1>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-bold py-0">
                  Live
                </Badge>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                #{slug} space
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-100/50 dark:bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
            <Users className="h-3.5 w-3.5 text-primary" /> Active Room
          </div>
        </div>

        {/* Chat Box Container */}
        <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-1 min-h-0 flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageSquare className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-sm font-bold text-slate-500">No messages yet</p>
              <p className="text-xs text-slate-400 mt-0.5">Send a message to start the discussion!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m) => {
                const isOwn = m.sender_email === user.email;
                return (
                  <div 
                    key={m.id}
                    className={`flex items-end gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isOwn && (
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${getAvatarColor(m.sender_email)}`}>
                        {getInitials(m.sender_name)}
                      </div>
                    )}
                    
                    <div className="max-w-[75%] space-y-1">
                      {!isOwn && (
                        <span className="text-[10px] font-bold text-slate-400 block px-1">
                          {m.sender_name}
                        </span>
                      )}
                      <div 
                        className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm font-medium ${
                          isOwn 
                            ? 'bg-primary text-primary-foreground rounded-br-none' 
                            : 'bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
                        }`}
                      >
                        {m.message}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>
          )}
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSendMessage} className="pt-4 border-t border-slate-200 dark:border-white/5 shrink-0">
          <div className="relative flex items-center bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm">
            <input
              type="text"
              required
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Send message to #${slug}...`}
              className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none placeholder-slate-400 font-medium"
            />
            <Button 
              type="submit" 
              disabled={!newMessage.trim() || sending}
              size="icon"
              className="rounded-xl h-10 w-10 bg-primary hover:bg-primary/95 text-primary-foreground shadow-sm"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}
