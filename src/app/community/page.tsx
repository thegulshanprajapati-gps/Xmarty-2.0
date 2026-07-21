'use client';

import { useState, useRef, useEffect } from "react";
import { useContentBlock } from "@/hooks/use-content-block";
import { Button } from "@/components/ui/button";
import { Hash, Bell, Search, Users, Send, CheckCircle2, Menu, X, Play } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import { EditableText } from "@/components/cms/editable-text";
import { CustomizableBadge } from "@/components/cms/customizable-badge";

interface ChatMessage {
  _id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  timestamp: string;
  channel: string;
}

export default function CommunityPage() {
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);

  // SEO Content Blocks
  const seoTitle = useContentBlock("community", "seo", "title", "Community - XmartyCreator", "text");
  const seoDesc = useContentBlock("community", "seo", "description", "Join the XmartyCreator community. Connect, learn, build and grow together.", "text");
  const seoKeywords = useContentBlock("community", "seo", "keywords", "community, learning, coding, support", "text");

  // CMS Content Blocks for pinned messages
  const heroTitle = useContentBlock("community", "hero", "title", "Community", "text");
  const heroSubtitle = useContentBlock("community", "hero", "subtitle", "Connects with social...", "text");
  const videoEmbedUrl = useContentBlock("community", "video", "youtubeEmbedUrl", "https://www.youtube.com/embed/dQw4w9WgXcQ", "text");
  const benefitsTitle = useContentBlock("community", "benefits", "title", "Learn, build, and grow together", "text");
  const benefitsSubtitle = useContentBlock("community", "benefits", "subtitle", "Get instant updates, live doubt-solving, weekly challenges, and exclusive resources curated for you.", "text");
  const channelsWhatsappLink = useContentBlock("community", "channels", "whatsappLink", "#", "text");
  const channelsTelegramLink = useContentBlock("community", "channels", "telegramLink", "#", "text");
  const channelsYoutubeLink = useContentBlock("community", "channels", "youtubeLink", "#", "text");

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/chat?channel=general-discussion');
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
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isSending) return;

    const currentMessage = inputValue;
    setInputValue("");
    setIsSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentMessage,
          senderId: user?.id || 'anonymous',
          senderName: user ? `${user.firstName} ${user.lastName}` : 'Guest User',
          senderRole: 'user',
          channel: 'general-discussion'
        })
      });
      if (res.ok) {
        fetchMessages();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setInputValue(currentMessage); // Restore input on failure
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100dvh-80px)] w-full overflow-hidden bg-background text-foreground font-sans relative">
      <title>{String(seoTitle.value)}</title>
      <meta name="description" content={String(seoDesc.value)} />
      <meta name="keywords" content={String(seoKeywords.value)} />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-20 left-0 md:static z-40 w-64 h-[calc(100dvh-80px)] md:h-full bg-slate-50 dark:bg-[#0B0D13] border-r border-slate-200 dark:border-slate-800/60 flex flex-col transition-transform duration-300 md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800/60 shrink-0 font-bold shadow-sm">
          <span className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-xs">X</span>
            XmartyCreator Hub
          </span>
          <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Information</div>
            <div className="space-y-0.5">
              <div className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md bg-primary/10 text-primary font-medium cursor-pointer">
                <Hash className="h-4 w-4 shrink-0" />
                <span className="truncate">general-discussion</span>
              </div>
              <div className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 font-medium cursor-pointer">
                <Hash className="h-4 w-4 shrink-0" />
                <span className="truncate">announcements</span>
              </div>
              <div className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 font-medium cursor-pointer">
                <Hash className="h-4 w-4 shrink-0" />
                <span className="truncate">resources</span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">External Channels</div>
            <div className="space-y-1">
              {channelsWhatsappLink.value !== '#' && (
                <Link href={String(channelsWhatsappLink.value)} target="_blank" className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-slate-600 dark:text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shrink-0" />
                  <span className="truncate">WhatsApp Group</span>
                </Link>
              )}
              {channelsTelegramLink.value !== '#' && (
                <Link href={String(channelsTelegramLink.value)} target="_blank" className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-slate-600 dark:text-slate-400 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                  <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center shrink-0" />
                  <span className="truncate">Telegram Channel</span>
                </Link>
              )}
              {channelsYoutubeLink.value !== '#' && (
                <Link href={String(channelsYoutubeLink.value)} target="_blank" className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-slate-600 dark:text-slate-400 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors">
                  <Play className="h-4 w-4 shrink-0 text-red-500" />
                  <span className="truncate">YouTube</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800/60 bg-slate-100/50 dark:bg-[#07090E] flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
            {user ? user.firstName?.charAt(0) || 'U' : 'G'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold truncate">{user ? `${user.firstName} ${user.lastName}` : 'Guest User'}</div>
            <div className="text-[10px] text-slate-500 truncate">{user ? 'Member' : 'Viewing Hub'}</div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-white dark:bg-[#030712] relative min-w-0">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800/60 shrink-0 shadow-sm z-10 bg-white/80 dark:bg-[#030712]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 -ml-2" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-slate-400" />
              <span className="font-bold text-base">general-discussion</span>
            </div>
          </div>
        </header>

        {/* Messages List */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 scroll-smooth">
          
          {/* Welcome Intro Banner styled as first message/header */}
          <div className="pt-10 pb-4 border-b border-slate-200 dark:border-slate-800/60 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-4">
              <Hash className="h-8 w-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome to #general-discussion!
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-base max-w-2xl">
              This is the start of the <span className="font-bold text-foreground">#general-discussion</span> channel. 
            </p>
          </div>

          {/* CMS Pinned Message 1 */}
          <div className="flex gap-4 group">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0 mt-0.5">
              XC
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold">XmartyCreator Admin</span>
                <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">System</span>
                <span className="text-xs text-slate-500">Pinned</span>
              </div>
              <div className="text-slate-800 dark:text-slate-200 space-y-4 pt-1">
                <div className="text-lg font-medium">
                  <EditableText pageSlug="community" sectionKey="hero" contentKey="title" defaultValue="Community" as="span" />
                </div>
                <p>
                  <EditableText pageSlug="community" sectionKey="hero" contentKey="subtitle" defaultValue="Connects with social..." as="span" />
                </p>
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 max-w-xl shadow-sm">
                  <div className="font-bold mb-2 text-primary flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <EditableText pageSlug="community" sectionKey="benefits" contentKey="title" defaultValue="Learn, build, and grow together" as="span" />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <EditableText pageSlug="community" sectionKey="benefits" contentKey="subtitle" defaultValue="Get instant updates, live doubt-solving, weekly challenges, and exclusive resources curated for you." as="span" />
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CMS Pinned Message 2 */}
          <div className="flex gap-4 group">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shrink-0 mt-0.5">
              M
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold">Mentor</span>
                <span className="text-xs text-slate-500">Pinned</span>
              </div>
              <div className="text-slate-800 dark:text-slate-200 pt-1">
                <p className="mb-3">Hey everyone! Check out our latest community update video below. We've got some exciting things planned! 🚀</p>
                {videoEmbedUrl.value !== '#' && videoEmbedUrl.value !== '' && (
                  <div className="relative w-full max-w-xl aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black shadow-md">
                    <iframe 
                      src={String(videoEmbedUrl.value)}
                      title="Community Video"
                      className="absolute inset-0 w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Real-time DB Messages */}
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
                placeholder={user ? "Message #general-discussion" : "Login to chat..."}
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
