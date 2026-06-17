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
              <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:scale-[1.03] transition-all duration-300 text-white h-12 px-6 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2">
                <a href={String(heroWhatsappLink.value)} target="_blank" rel="noopener noreferrer">
                  <i className="fa-brands fa-whatsapp text-lg"></i> Join WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline" className="group/intro border-slate-200 hover:border-primary/50 hover:bg-primary/5 dark:border-slate-800 dark:hover:bg-primary/10 hover:text-primary hover:scale-[1.03] hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-12 px-6 font-bold text-sm rounded-xl flex items-center gap-2">
                <a href={String(heroIntroLink.value)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <Play className="h-4 w-4 fill-current transition-transform duration-300 group-hover/intro:scale-110 group-hover/intro:translate-x-0.5" /> Watch Intro
                </a>
              </Button>
            </div>

            {/* Stats Blocks Container */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-1 hover:shadow-md transition-all duration-300">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">CHANNELS</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{String(heroChannelsStat.value)}</span>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-1 hover:shadow-md transition-all duration-300">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">LIVE EVENTS</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{String(heroEventsStat.value)}</span>
              </div>
            </div>
          </div>

          {/* Right Column visual: triangle node graphic inside soft container */}
          <div className="flex justify-center md:justify-end node-container-float">
            <div className="relative w-full max-w-[420px] aspect-square rounded-[2.5rem] bg-gradient-to-br from-indigo-50/50 to-violet-50/50 dark:from-slate-900/40 dark:to-slate-950/40 border border-indigo-100/50 dark:border-slate-800/50 shadow-inner flex items-center justify-center p-8 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.08),transparent_50%)]"></div>
              
              {/* Animated Connection Nodes */}
              <div className="absolute inset-0 z-20 pointer-events-none">
                {/* Users icon at (200, 80) -> relative left: 50% (200/400), top: 20% (80/400) */}
                <div 
                  className="absolute pointer-events-auto cursor-pointer transition-transform duration-300 hover:scale-110 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                  style={{ left: '50%', top: '20%' }}
                >
                  <div className="h-12 w-12 rounded-full bg-gradient-to-b from-[#A78BFA] to-[#7C3AED] border-2 border-[#8B5CF6] shadow-lg flex items-center justify-center text-white">
                    <Users className="h-5 w-5" />
                  </div>
                </div>

                {/* MessageSquare icon at (90, 260) -> relative left: 22.5% (90/400), top: 65% (260/400) */}
                <div 
                  className="absolute pointer-events-auto cursor-pointer transition-transform duration-300 hover:scale-110 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                  style={{ left: '22.5%', top: '65%' }}
                >
                  <div className="h-12 w-12 rounded-full bg-gradient-to-b from-[#34D399] to-[#059669] border-2 border-[#10B981] shadow-lg flex items-center justify-center text-white">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                </div>

                {/* Sparkles icon at (310, 260) -> relative left: 77.5% (310/400), top: 65% (260/400) */}
                <div 
                  className="absolute pointer-events-auto cursor-pointer transition-transform duration-300 hover:scale-110 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                  style={{ left: '77.5%', top: '65%' }}
                >
                  <div className="h-12 w-12 rounded-full bg-gradient-to-b from-[#22D3EE] to-[#0891B2] border-2 border-[#06B6D4] shadow-lg flex items-center justify-center text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <svg className="w-full h-full relative z-10" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Connecting Lines */}
                <path d="M200 80 L90 260 M200 80 L310 260 M90 260 L310 260" stroke="currentColor" strokeWidth="2" className="text-indigo-200/40 dark:text-slate-800/40" />
                <path d="M200 80 L90 260" stroke="url(#line-grad-1)" strokeWidth="2.5" className="node-flow-line" />
                <path d="M200 80 L310 260" stroke="url(#line-grad-2)" strokeWidth="2.5" className="node-flow-line" />
                
                {/* Outer Glows */}
                <circle cx="200" cy="80" r="32" fill="url(#glow-violet)" className="node-outer-glow" />
                <circle cx="90" cy="260" r="32" fill="url(#glow-emerald)" className="node-outer-glow" style={{ animationDelay: '-1s' }} />
                <circle cx="310" cy="260" r="32" fill="url(#glow-cyan)" className="node-outer-glow" style={{ animationDelay: '-2s' }} />

                {/* Gradients */}
                <defs>
                  <linearGradient id="line-grad-1" x1="200" y1="80" x2="90" y2="260" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8B5CF6" />
                    <stop offset="1" stopColor="#10B981" />
                  </linearGradient>
                  <linearGradient id="line-grad-2" x1="200" y1="80" x2="310" y2="260" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8B5CF6" />
                    <stop offset="1" stopColor="#06B6D4" />
                  </linearGradient>
                  
                  <radialGradient id="glow-violet" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(200 80) rotate(90) scale(32)">
                    <stop stopColor="#8B5CF6" stopOpacity="0.3" />
                    <stop offset="1" stopColor="#8B5CF6" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="glow-emerald" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(90 260) rotate(90) scale(32)">
                    <stop stopColor="#10B981" stopOpacity="0.3" />
                    <stop offset="1" stopColor="#10B981" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="glow-cyan" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(310 260) rotate(90) scale(32)">
                    <stop stopColor="#06B6D4" stopOpacity="0.3" />
                    <stop offset="1" stopColor="#06B6D4" stopOpacity="0" />
                  </radialGradient>

                  <linearGradient id="node-violet" x1="200" y1="56" x2="200" y2="104" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A78BFA" />
                    <stop offset="1" stopColor="#7C3AED" />
                  </linearGradient>
                  <linearGradient id="node-emerald" x1="90" y1="236" x2="90" y2="284" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#34D399" />
                    <stop offset="1" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="node-cyan" x1="310" y1="236" x2="310" y2="284" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#22D3EE" />
                    <stop offset="1" stopColor="#0891B2" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Decorative background grid elements */}
              <div className="absolute top-12 left-12 w-2 h-2 rounded-full bg-indigo-300/30 dark:bg-slate-700/30"></div>
              <div className="absolute bottom-12 right-24 w-3.5 h-3.5 rounded-full bg-violet-300/20 dark:bg-slate-700/20"></div>
            </div>
          </div>
        </section>

        {/* 2. KYP YouTube Video Embed Section */}
        <section className="space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Watch how it works</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Discover inside walks, live setups and community showcases.</p>
          </div>
          <div className="aspect-video w-full max-w-4xl mx-auto rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl shadow-rose-500/10 dark:shadow-rose-950/20 hover:shadow-rose-500/20 hover:scale-[1.01] transition-all duration-500">
            <iframe 
              src={String(videoEmbedUrl.value)} 
              title="YouTube video player" 
              className="w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
            ></iframe>
          </div>
        </section>

        {/* 3. Community Hub Coming Soon Section */}
        <section 
          className="relative rounded-[2.5rem] text-white p-8 md:p-12 overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-xl"
          style={{ 
            background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.85) 100%)',
            boxShadow: '0 20px 25px -5px hsl(var(--primary) / 0.15), 0 8px 10px -6px hsl(var(--primary) / 0.15)'
          }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div 
            className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-30"
            style={{ backgroundColor: 'hsl(var(--primary))' }}
          ></div>
          
          <div className="relative z-10 space-y-6 max-w-xl">
            <Badge className="bg-white/20 backdrop-blur-md border border-white/20 text-white px-3.5 py-1 rounded-full font-bold text-xs tracking-wider uppercase">
              {String(hubBadge.value)}
            </Badge>
            <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
              {String(hubTitle.value)}
            </h2>
            <p className="text-sm text-white/90 leading-relaxed font-medium">
              {String(hubDesc.value)}
            </p>
            <Button asChild className="bg-white text-slate-900 hover:bg-slate-100 font-bold px-6 h-11 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.03]">
              <a href={String(hubButtonLink.value)} target="_blank" rel="noopener noreferrer">
                {String(hubButtonText.value)}
              </a>
            </Button>
          </div>
        </section>

        {/* 4. Why join our community section */}
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
            {/* Card 1: Direct doubts support */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="h-10 w-10 bg-primary/10 dark:bg-primary/25 rounded-xl flex items-center justify-center text-primary">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 dark:text-white">Direct doubts support</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                  Stuck on a bug? Share your queries and get live community support instantly.
                </p>
              </div>
            </div>

            {/* Card 2: Peer power */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
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
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
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
            <div className="relative group overflow-hidden rounded-3xl bg-gradient-to-b from-[#10B981] to-[#059669] dark:from-[#10B981]/90 dark:to-[#059669]/90 p-6 flex flex-col justify-between aspect-[3/4] text-white shadow-xl hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-15 text-white/50 pointer-events-none transition-transform duration-500 group-hover:scale-110">
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
              <Button asChild className="w-full bg-white/20 hover:bg-white/40 backdrop-blur-sm border border-white/20 font-semibold text-xs h-10 rounded-xl relative z-10 text-white transition-colors duration-300">
                <a href={String(channelsWhatsappLink.value)} target="_blank" rel="noopener noreferrer">
                  Join <span className="ml-1">→</span>
                </a>
              </Button>
            </div>

            {/* App */}
            <div className="relative group overflow-hidden rounded-3xl bg-gradient-to-b from-[#3B82F6] to-[#1D4ED8] dark:from-[#2563EB]/95 dark:to-[#1E3A8A]/95 p-6 flex flex-col justify-between aspect-[3/4] text-white shadow-xl hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-15 text-white/50 pointer-events-none transition-transform duration-500 group-hover:scale-110">
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
              <Button asChild className="w-full bg-white/20 hover:bg-white/40 backdrop-blur-sm border border-white/20 font-semibold text-xs h-10 rounded-xl relative z-10 text-white transition-colors duration-300">
                <a href={String(channelsAppLink.value)} target="_blank" rel="noopener noreferrer">
                  Download <span className="ml-1">→</span>
                </a>
              </Button>
            </div>

            {/* Telegram */}
            <div className="relative group overflow-hidden rounded-3xl bg-gradient-to-b from-[#06B6D4] to-[#0369A1] dark:from-[#0891B2]/95 dark:to-[#075985]/95 p-6 flex flex-col justify-between aspect-[3/4] text-white shadow-xl hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-15 text-white/50 pointer-events-none transition-transform duration-500 group-hover:scale-110">
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
              <Button asChild className="w-full bg-white/20 hover:bg-white/40 backdrop-blur-sm border border-white/20 font-semibold text-xs h-10 rounded-xl relative z-10 text-white transition-colors duration-300">
                <a href={String(channelsTelegramLink.value)} target="_blank" rel="noopener noreferrer">
                  Join <span className="ml-1">→</span>
                </a>
              </Button>
            </div>

            {/* YouTube */}
            <div className="relative group overflow-hidden rounded-3xl bg-gradient-to-b from-[#EF4444] to-[#B91C1C] dark:from-[#DC2626]/95 dark:to-[#991B1B]/95 p-6 flex flex-col justify-between aspect-[3/4] text-white shadow-xl hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-15 text-white/50 pointer-events-none transition-transform duration-500 group-hover:scale-110">
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
              <Button asChild className="w-full bg-white/20 hover:bg-white/45 backdrop-blur-sm border border-white/20 font-semibold text-xs h-10 rounded-xl relative z-10 text-white transition-colors duration-300">
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
