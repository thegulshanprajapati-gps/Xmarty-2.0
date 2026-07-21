'use client';

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Send, Users, Bell, Search, Menu, Hash, ChevronLeft } from "lucide-react";
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
    <div className="flex w-full h-[calc(100dvh-80px)] overflow-hidden bg-white dark:bg-[#030712] text-foreground">
      
      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:static z-50 w-64 h-full bg-slate-50 dark:bg-[#0B0D13] border-r border-slate-200 dark:border-slate-800/60 flex flex-col transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="h-14 flex items-center px-4 border-b border-slate-200 dark:border-slate-800/60 shrink-0 shadow-sm gap-2">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 -ml-2 shrink-0 text-slate-500 hover:text-slate-900 dark:hover:text-white">
            <Link href="/community/hub">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <span className="font-bold font-headline truncate">Xmarty Hub</span>
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
                    "w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors",
                    currentChannel === ch 
                      ? "bg-slate-200/50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium" 
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-200/30 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  <Hash className="h-4 w-4 shrink-0 opacity-70" />
                  <span className="truncate">{ch.replace(/-/g, ' ')}</span>
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
              <Hash className="h-5 w-5 text-slate-400" />
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
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <div className="pt-10 pb-6 border-b border-slate-200/50 dark:border-slate-800/50 mb-6">
            <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
              <Hash className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2 capitalize">
              Welcome to #{currentChannel.replace(/-/g, ' ')}!
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-base max-w-2xl">
              This is the start of the <span className="font-bold text-foreground">#{currentChannel.replace(/-/g, ' ')}</span> channel. 
            </p>
          </div>

          {messages.map((msg) => (
            <div key={msg._id} className="flex gap-4 group hover:bg-slate-50 dark:hover:bg-slate-900/50 p-2 -mx-2 rounded-xl transition-colors">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 mt-0.5",
                msg.senderRole === 'admin' ? 'bg-red-500' : 'bg-slate-700'
              )}>
                {msg.senderName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{msg.senderName}</span>
                  {msg.senderRole === 'admin' && (
                    <span className="text-[10px] bg-red-500/20 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">Admin</span>
                  )}
                  <span className="text-xs text-slate-500">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-slate-800 dark:text-slate-200 pt-1 text-[15px]">
                  {msg.message}
                </div>
              </div>
            </div>
          ))}
          <div className="h-4" /> {/* Spacer */}
        </div>

        {/* Input Area */}
        <div className="p-4 shrink-0 bg-white dark:bg-[#030712] border-t border-slate-100 dark:border-slate-800/60">
          <form onSubmit={handleSendMessage} className="relative flex items-center bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm focus-within:ring-1 focus-within:ring-primary/50 transition-all">
            <div className="flex-1 min-h-[48px] flex items-center px-4">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={user ? `Message #${currentChannel.replace(/-/g, ' ')}` : "Login to chat..."}
                disabled={!user || isSending}
                className="w-full bg-transparent border-none focus:outline-none text-sm text-foreground placeholder:text-slate-500 h-full py-3 disabled:opacity-50"
              />
            </div>
            <div className="pr-2 flex items-center">
              <Button type="submit" disabled={!user || isSending || !inputValue.trim()} size="icon" className="h-8 w-8 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-50">
                <Send className="h-4 w-4 ml-0.5" />
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
