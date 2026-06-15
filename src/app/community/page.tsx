'use client';

import { useState, useEffect } from "react";
import { useContentBlock } from "@/hooks/use-content-block";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, Sparkles, Send, Play, Download, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";

export default function CommunityPage() {
  const { user } = useUser();
  // SEO Content Blocks
  const seoTitle = useContentBlock("community", "seo", "title", "Community - XmartyCreator", "text");
  const seoDesc = useContentBlock("community", "seo", "description", "Join the XmartyCreator community. Connect, learn, build and grow together.", "text");
  const seoKeywords = useContentBlock("community", "seo", "keywords", "community, learning, coding, support", "text");

  // Hero Section Blocks
  const heroBadge = useContentBlock("community", "hero", "badgeText", "Community HQ", "text");
  const heroTitle = useContentBlock("community", "hero", "title", "Community", "text");
  const heroSubtitle = useContentBlock("community", "hero", "subtitle", "Connects with social...", "text");
  const heroWhatsappLink = useContentBlock("community", "hero", "whatsappLink", "#", "text");
  const heroIntroLink = useContentBlock("community", "hero", "introLink", "#", "text");
  const heroChannelsStat = useContentBlock("community", "hero", "channelsStat", "WhatsApp, Telegram, App", "text");
  const heroEventsStat = useContentBlock("community", "hero", "eventsStat", "Weekly sessions", "text");

  // Video Section Blocks
  const videoEmbedUrl = useContentBlock("community", "video", "youtubeEmbedUrl", "https://www.youtube.com/embed/dQw4w9WgXcQ", "text");

  // Hub Banner Blocks
  const hubBadge = useContentBlock("community", "hub", "badgeText", "Coming soon", "text");
  const hubTitle = useContentBlock("community", "hub", "title", "Join our Community Hub", "text");
  const hubDesc = useContentBlock("community", "hub", "description", "A dedicated space for events, resources, and member shout-outs. Launching shortly.", "text");
  const hubButtonText = useContentBlock("community", "hub", "buttonText", "Open hub", "text");
  const hubButtonLink = useContentBlock("community", "hub", "buttonLink", "#", "text");

  // Benefits Section Blocks
  const benefitsBadge = useContentBlock("community", "benefits", "badgeText", "Why join our community", "text");
  const benefitsTitle = useContentBlock("community", "benefits", "title", "Learn, build, and grow together", "text");
  const benefitsSubtitle = useContentBlock("community", "benefits", "subtitle", "Get instant updates, live doubt-solving, weekly challenges, and exclusive resources curated for you.", "text");

  // Channels Section Blocks
  const channelsBadge = useContentBlock("community", "channels", "badgeText", "Join our communities", "text");
  const channelsTitle = useContentBlock("community", "channels", "title", "Pick your favorite channel", "text");
  const channelsSubtitle = useContentBlock("community", "channels", "subtitle", "Choose where you want to stay connected with Xmarty Creator", "text");
  const channelsWhatsappLink = useContentBlock("community", "channels", "whatsappLink", "#", "text");
  const channelsAppLink = useContentBlock("community", "channels", "appLink", "#", "text");
  const channelsTelegramLink = useContentBlock("community", "channels", "telegramLink", "#", "text");
  const channelsYoutubeLink = useContentBlock("community", "channels", "youtubeLink", "#", "text");

  return (
    <div className="w-full bg-[#FAFCFF] dark:bg-[#030712] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <style>{`
        @keyframes flow-dash {
          to {
            stroke-dashoffset: -20;
          }
        }
        @keyframes pulse-glow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.25);
            opacity: 0.85;
          }
        }
        @keyframes float-nodes {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        .node-flow-line {
          stroke-dasharray: 6 4;
          animation: flow-dash 1.5s linear infinite;
        }
        .node-outer-glow {
          transform-origin: center;
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .node-container-float {
          animation: float-nodes 4s ease-in-out infinite;
        }
      `}</style>
      <title>{String(seoTitle.value)}</title>
      <meta name="description" content={String(seoDesc.value)} />
      <meta name="keywords" content={String(seoKeywords.value)} />

      <main className="max-w-5xl mx-auto px-4 py-12 space-y-16">
        
        {/* 1. Hero Grid Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Left Column info */}
          <div className="space-y-6">
            <Badge className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-3 py-1 rounded-full font-bold text-xs tracking-wider flex items-center gap-1.5 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              {String(heroBadge.value)}
            </Badge>

            <h1 className="text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-tight">
              {String(heroTitle.value)}
            </h1>

            <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {String(heroSubtitle.value)}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white h-12 px-6 font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                <a href={String(heroWhatsappLink.value)} target="_blank" rel="noopener noreferrer">
                  <i className="fa-brands fa-whatsapp text-lg"></i> Join WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline" className="border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 h-12 px-6 font-bold text-sm rounded-xl flex items-center gap-2">
                <a href={String(heroIntroLink.value)} target="_blank" rel="noopener noreferrer">
                  <Play className="h-4 w-4 fill-current" /> Watch Intro
                </a>
              </Button>
            </div>

            {/* Stats Blocks Container */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">CHANNELS</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{String(heroChannelsStat.value)}</span>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">LIVE EVENTS</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{String(heroEventsStat.value)}</span>
              </div>
            </div>
          </div>

          {/* Right Column visual: triangle node graphic inside soft container */}
          <div className="flex justify-center md:justify-end">
            <div className="relative w-full max-w-sm aspect-[4/3] rounded-3xl bg-primary/5 dark:bg-slate-950/40 flex items-center justify-center border border-primary/10 dark:border-white/5 shadow-inner">
              <svg width="220" height="220" viewBox="0 0 200 200" className="text-primary/80 dark:text-primary/80 node-container-float">
                {/* SVG Connections with Flow animation */}
                <line x1="100" y1="45" x2="50" y2="140" stroke="currentColor" strokeWidth="2" className="node-flow-line" />
                <line x1="100" y1="45" x2="150" y2="140" stroke="currentColor" strokeWidth="2" className="node-flow-line" />
                <line x1="50" y1="140" x2="150" y2="140" stroke="currentColor" strokeWidth="2" className="node-flow-line" />
                
                {/* Top Node Outer Glow */}
                <circle cx="100" cy="45" r="16" fill="none" stroke="currentColor" strokeWidth="1.5" className="node-outer-glow" style={{ animationDelay: '0s' }} />
                <circle cx="100" cy="45" r="6" fill="currentColor" />
                
                {/* Bottom Left Node Outer Glow */}
                <circle cx="50" cy="140" r="16" fill="none" stroke="currentColor" strokeWidth="1.5" className="node-outer-glow" style={{ animationDelay: '1s' }} />
                <circle cx="50" cy="140" r="6" fill="currentColor" />
                
                {/* Bottom Right Node Outer Glow */}
                <circle cx="150" cy="140" r="16" fill="none" stroke="currentColor" strokeWidth="1.5" className="node-outer-glow" style={{ animationDelay: '2s' }} />
                <circle cx="150" cy="140" r="6" fill="currentColor" />
              </svg>
            </div>
          </div>
        </section>

        {/* 2. KYP YouTube Video Embed Section */}
        <section className="w-full">
          <div className="relative aspect-video w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-black">
            <iframe 
              className="w-full h-full"
              src={String(videoEmbedUrl.value)} 
              title="Community Intro Video" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            />
          </div>
        </section>

        {/* 3. Community Hub CTA Banner */}
        <section>
          <div className="w-full bg-gradient-to-r from-primary/10 to-accent/10 bg-slate-50 dark:bg-slate-950/20 border border-primary/10 dark:border-white/5 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <Badge className={cn(
                "font-bold px-2.5 py-0.5 rounded-full text-xs border",
                user 
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" 
                  : "bg-primary/10 text-primary border-primary/20"
              )}>
                {user ? "Active Hub" : String(hubBadge.value)}
              </Badge>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {user ? "Your Community Hub is Active" : String(hubTitle.value)}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
                {user 
                  ? "You have full access to all chat groups, mobile apps, updates and exclusive tutorials." 
                  : String(hubDesc.value)}
              </p>
            </div>
            <Button asChild className="bg-primary hover:bg-primary/95 text-white dark:bg-primary dark:hover:bg-primary/90 font-bold text-xs h-11 px-5 rounded-xl shrink-0 gap-1 shadow-sm">
              <Link href={user ? "/community/hub" : `/login?redirect=${encodeURIComponent("/community/hub")}`}>
                {user ? "Open Hub Dashboard" : "Login to Access"} <span className="text-sm">→</span>
              </Link>
            </Button>
          </div>
        </section>

        {/* 4. Benefits Section ("Learn, build, and grow together") */}
        <section className="space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full font-bold text-xs tracking-wider uppercase">
              {String(benefitsBadge.value)}
            </Badge>
            <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              {String(benefitsTitle.value)}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {String(benefitsSubtitle.value)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Instant updates */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 bg-primary/10 dark:bg-primary/25 rounded-xl flex items-center justify-center text-primary">
                <Send className="h-5 w-5" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 dark:text-white">Instant updates</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                  Never miss drops, deadlines, or release notes.
                </p>
              </div>
            </div>

            {/* Card 2: Peer power */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 bg-primary/10 dark:bg-primary/25 rounded-xl flex items-center justify-center text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 dark:text-white">Peer power</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                  Team up for projects, mock interviews, and accountability.
                </p>
              </div>
            </div>

            {/* Card 3: Exclusive goodies */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 bg-primary/10 dark:bg-primary/25 rounded-xl flex items-center justify-center text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 dark:text-white">Exclusive goodies</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                  Early access templates, notes, and surprise bonuses.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Pick your favorite channel section */}
        <section className="space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full font-bold text-xs tracking-wider uppercase">
              {String(channelsBadge.value)}
            </Badge>
            <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              {String(channelsTitle.value)}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {String(channelsSubtitle.value)}
            </p>
          </div>

          {/* 4 Gradient Channel Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* WhatsApp */}
            <div className="relative group overflow-hidden rounded-3xl bg-gradient-to-b from-[#10B981] to-[#059669] dark:from-[#10B981]/90 dark:to-[#059669]/90 p-6 flex flex-col justify-between aspect-[3/4] text-white shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-15 text-white/50 pointer-events-none">
                <i className="fa-brands fa-whatsapp text-8xl"></i>
              </div>
              <div className="space-y-4 relative z-10">
                <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <i className="fa-brands fa-whatsapp text-2xl"></i>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold">WhatsApp</h3>
                  <p className="text-xs text-emerald-100 leading-relaxed">
                    Get instant updates, notes, and quick support from the main group.
                  </p>
                </div>
              </div>
              <Button asChild className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 font-semibold text-xs h-10 rounded-xl relative z-10 text-white">
                <a href={String(channelsWhatsappLink.value)} target="_blank" rel="noopener noreferrer">
                  Join <span className="ml-1">→</span>
                </a>
              </Button>
            </div>

            {/* App */}
            <div className="relative group overflow-hidden rounded-3xl bg-gradient-to-b from-[#3B82F6] to-[#1D4ED8] dark:from-[#2563EB]/95 dark:to-[#1E3A8A]/95 p-6 flex flex-col justify-between aspect-[3/4] text-white shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-15 text-white/50 pointer-events-none">
                <Download className="h-24 w-24" />
              </div>
              <div className="space-y-4 relative z-10">
                <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Download className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold">App</h3>
                  <p className="text-xs text-blue-100 leading-relaxed">
                    Access classes, announcements, and community resources in one place.
                  </p>
                </div>
              </div>
              <Button asChild className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 font-semibold text-xs h-10 rounded-xl relative z-10 text-white">
                <a href={String(channelsAppLink.value)} target="_blank" rel="noopener noreferrer">
                  Download <span className="ml-1">→</span>
                </a>
              </Button>
            </div>

            {/* Telegram */}
            <div className="relative group overflow-hidden rounded-3xl bg-gradient-to-b from-[#06B6D4] to-[#0369A1] dark:from-[#0891B2]/95 dark:to-[#075985]/95 p-6 flex flex-col justify-between aspect-[3/4] text-white shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-15 text-white/50 pointer-events-none">
                <i className="fa-brands fa-telegram text-8xl"></i>
              </div>
              <div className="space-y-4 relative z-10">
                <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <i className="fa-brands fa-telegram text-2xl"></i>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold">Telegram</h3>
                  <p className="text-xs text-cyan-100 leading-relaxed">
                    Join focused discussion channels and fast-moving updates.
                  </p>
                </div>
              </div>
              <Button asChild className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 font-semibold text-xs h-10 rounded-xl relative z-10 text-white">
                <a href={String(channelsTelegramLink.value)} target="_blank" rel="noopener noreferrer">
                  Join <span className="ml-1">→</span>
                </a>
              </Button>
            </div>

            {/* YouTube */}
            <div className="relative group overflow-hidden rounded-3xl bg-gradient-to-b from-[#EF4444] to-[#B91C1C] dark:from-[#DC2626]/95 dark:to-[#991B1B]/95 p-6 flex flex-col justify-between aspect-[3/4] text-white shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-15 text-white/50 pointer-events-none">
                <i className="fa-brands fa-youtube text-8xl"></i>
              </div>
              <div className="space-y-4 relative z-10">
                <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <i className="fa-brands fa-youtube text-2xl"></i>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold">YouTube</h3>
                  <p className="text-xs text-red-100 leading-relaxed">
                    Watch latest videos, tutorials, and live sessions from Xmarty Creator.
                  </p>
                </div>
              </div>
              <Button asChild className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 font-semibold text-xs h-10 rounded-xl relative z-10 text-white">
                <a href={String(channelsYoutubeLink.value)} target="_blank" rel="noopener noreferrer">
                  Subscribe <span className="ml-1">→</span>
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
