'use client';

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Send, Users, Bell, Search, Menu, Hash, ChevronLeft, X } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";

interface ChatMessage {
  _id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  timestamp: string;
  channel: string;
}

const SIDEBAR_CHANNELS = [
  "general-discussion",
  "announcements",
  "help-and-support"
];

export default function HubChannelChat() {
  const { user } = useUser();
  const params = useParams();
  const currentChannel = typeof params.slug === 'string' ? params.slug : "general-discussion";
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat?channel=${currentChannel}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [currentChannel]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isSending) return;

    const currentMsg = inputValue;
    setInputValue("");
    setIsSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentMsg,
          senderId: user?.id || 'anonymous',
          senderName: user ? `${user.firstName} ${user.lastName}` : 'Guest User',
          senderRole: 'user',
          channel: currentChannel
        })
      });
      if (res.ok) {
        fetchMessages();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setInputValue(currentMsg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex w-full h-[calc(100dvh-80px)] overflow-hidden bg-[#FAFCFF] dark:bg-[#030712] text-foreground">
      
      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/55 z-40 md:hidden backdrop-blur-sm transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:static z-50 w-64 h-full bg-slate-50 dark:bg-[#0B0D13] border-r border-slate-200 dark:border-slate-800/60 flex flex-col transition-transform duration-300 ease-in-out shadow-lg md:shadow-none",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800/60 shrink-0 shadow-sm">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8 -ml-2 shrink-0 text-slate-500 hover:text-slate-900 dark:hover:text-white">
              <Link href="/community/hub">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
            <span className="font-bold font-headline truncate">Xmarty Hub</span>
          </div>
          {/* Close Sidebar Button for Mobile */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden h-8 w-8 -mr-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
              Text Channels
            </div>
            <div className="space-y-0.5">
              {SIDEBAR_CHANNELS.map(ch => (
                <Link 
                  key={ch}
                  href={`/community/hub/${ch}`}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2.5 py-2.5 rounded-xl text-sm transition-all",
                    currentChannel === ch 
                      ? "bg-primary/10 text-primary font-bold" 
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-slate-850/40 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  <Hash className={cn("h-4 w-4 shrink-0", currentChannel === ch ? "text-primary" : "opacity-60")} />
                  <span className="truncate capitalize">{ch.replace(/-/g, ' ')}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full bg-white dark:bg-[#030712]">
        {/* Chat Header */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800/60 shrink-0 bg-white/95 dark:bg-[#030712]/95 backdrop-blur z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden -ml-2 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <Hash className="h-5 w-5 text-primary/80" />
              <span className="font-bold text-base capitalize">{currentChannel.replace(/-/g, ' ')}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-3 text-slate-400">
            <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex hover:text-slate-900 dark:hover:text-white">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex hover:text-slate-900 dark:hover:text-white">
              <Users className="h-5 w-5" />
            </Button>
            <div className="relative hidden md:block">
              <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search" 
                className="bg-slate-100 dark:bg-slate-900 border-none rounded-md h-7 pl-8 pr-2 text-xs w-36 focus:outline-none focus:ring-1 focus:ring-primary text-slate-900 dark:text-slate-100 placeholder:text-slate-500"
              />
            </div>
          </div>
        </header>

        {/* Messages List */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/20 dark:bg-slate-950/10">
          <div className="pt-8 pb-6 border-b border-slate-200/50 dark:border-slate-800/50 mb-6 flex flex-col items-start">
            <div className="h-12 w-12 bg-primary/10 dark:bg-primary/25 rounded-2xl flex items-center justify-center mb-3 text-primary">
              <Hash className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1.5 capitalize">
              Welcome to #{currentChannel.replace(/-/g, ' ')}!
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium max-w-2xl">
              This is the start of the #{currentChannel.replace(/-/g, ' ')} channel. Use it to discuss topics with other members.
            </p>
          </div>

          {messages.map((msg) => {
            const isMe = user && msg.senderId === user.id;
            return (
              <div 
                key={msg._id} 
                className={cn(
                  "flex gap-3 max-w-[85%] rounded-2xl p-3 border text-sm transition-all",
                  isMe 
                    ? "bg-primary/5 dark:bg-primary/10 border-primary/25 ml-auto flex-row-reverse" 
                    : "bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800/80 mr-auto"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5 shadow-sm",
                  msg.senderRole === 'admin' ? 'bg-red-500' : 'bg-slate-700'
                )}>
                  {msg.senderName.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className={cn("flex items-center gap-1.5", isMe && "justify-end")}>
                    <span className="font-bold text-xs text-foreground truncate">{msg.senderName}</span>
                    {msg.senderRole === 'admin' && (
                      <span className="text-[9px] bg-red-500/20 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Admin</span>
                    )}
                    <span className="text-[10px] text-slate-500 shrink-0">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className={cn("text-slate-800 dark:text-slate-200 break-words leading-relaxed text-[14px]", isMe && "text-right")}>
                    {msg.message}
                  </div>
                </div>
              </div>
            );
          })}
          <div className="h-4" /> {/* Spacer */}
        </div>

        {/* Input Area */}
        <div className="p-4 shrink-0 bg-white dark:bg-[#030712] border-t border-slate-100 dark:border-slate-800/60">
          <form onSubmit={handleSendMessage} className="relative flex items-center bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm focus-within:ring-1 focus-within:ring-primary/50 transition-all">
            <div className="flex-1 min-h-[50px] flex items-center px-4">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={user ? `Message #${currentChannel.replace(/-/g, ' ')}` : "Login to join chat..."}
                disabled={!user || isSending}
                className="w-full bg-transparent border-none focus:outline-none text-sm text-foreground placeholder:text-slate-500 h-full py-3.5 disabled:opacity-50"
              />
            </div>
            <div className="pr-3 flex items-center">
              <Button type="submit" disabled={!user || isSending || !inputValue.trim()} size="icon" className="h-9 w-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-50">
                <Send className="h-4.5 w-4.5 ml-0.5" />
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
