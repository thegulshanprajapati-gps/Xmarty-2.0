'use client';

import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  BrainCircuit,
  BriefcaseBusiness,
  GraduationCap,
  MessageSquare,
  Play,
  Sparkles,
  Users,
  Star,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EditableText } from "@/components/cms/editable-text";
import { CustomizableBadge } from "@/components/cms/customizable-badge";
import { useContentBlock } from "@/hooks/use-content-block";

const parseCmsImage = (val: any, defaultUrl: string) => {
  try {
    if (typeof val === 'string' && val.trim().startsWith('{')) {
      const parsed = JSON.parse(val);
      return {
        url: parsed.url || defaultUrl,
        alt: parsed.alt || '',
        width: parsed.width || '',
        height: parsed.height || '',
      };
    }
  } catch (e) {}
  return {
    url: typeof val === 'string' ? val || defaultUrl : defaultUrl,
    alt: '',
    width: '',
    height: '',
  };
};

function CountUp({ value }: { value: string }) {
  const [count, setCount] = useState(0);

  const { numericValue, suffix } = useMemo(() => {
    if (!value) return { numericValue: 0, suffix: "" };
    const numMatch = value.match(/^([\d,.]+)(.*)$/);
    if (!numMatch) return { numericValue: 0, suffix: value };
    const numStr = numMatch[1].replace(/,/g, "");
    const parsed = parseFloat(numStr);
    return {
      numericValue: isNaN(parsed) ? 0 : parsed,
      suffix: numMatch[2] || "",
    };
  }, [value]);

  useEffect(() => {
    let start = 0;
    const end = numericValue;
    if (end === 0) {
      setCount(0);
      return;
    }

    const duration = 1500;
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const easedProgress = progress * (2 - progress);
      const current = Math.round(easedProgress * end);
      
      if (frame >= totalFrames) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, [numericValue]);

  const formattedCount = useMemo(() => {
    return count.toLocaleString();
  }, [count]);

  return (
    <span>
      {formattedCount}
      {suffix}
    </span>
  );
}

const defaultStats = [
  { label: "Active learners", value: "45K+" },
  { label: "Industry projects", value: "120+" },
  { label: "Mentor sessions", value: "8K+" },
];

const defaultPathways = [
  {
    title: "Build Production Skills",
    desc: "Learn modern frontend, backend, architecture, and deployment through practical course tracks.",
    icon: BookOpen,
  },
  {
    title: "Practice With AI Guidance",
    desc: "Use Vasant AI for quick explanations, debugging help, and personalized learning direction.",
    icon: BrainCircuit,
  },
  {
    title: "Grow With Community",
    desc: "Join study circles, code reviews, discussions, and creator groups that keep momentum alive.",
    icon: Users,
  },
  {
    title: "Prepare For Careers",
    desc: "Turn projects into portfolio proof and follow updates for internships, placements, and launches.",
    icon: BriefcaseBusiness,
  },
];

const defaultTestimonials = [
  {
    name: "Aman Gupta",
    role: "Full-Stack Developer @ Razorpay",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=200&h=200",
    rating: "5",
    review: "This is the best learning platform. I built 3 real-world projects that got me hired!"
  },
  {
    name: "Sneha Reddy",
    role: "Frontend Engineer @ Razorpay",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=200&h=200",
    rating: "5",
    review: "The Vasant AI guidance is like having a Senior Engineer next to you 24/7. Highly recommend!"
  },
  {
    name: "Rohan Verma",
    role: "Freelance Creator",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fit=crop&w=200&h=200",
    rating: "5",
    review: "Very practical courses. I learned production-grade Next.js, database integration and styling in days."
  }
];

const iconMap: Record<string, any> = {
  MessageSquare,
  BadgeCheck,
  GraduationCap,
};

const defaultCommunityFeatures = [
  { icon: MessageSquare, label: "Daily discussions" },
  { icon: BadgeCheck, label: "Project reviews" },
  { icon: GraduationCap, label: "Career updates" },
];

function InteractiveHeroVisual({ heroImageInfo, heroMobileImageInfo }: { heroImageInfo: any; heroMobileImageInfo: any }) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    // Rotate up to 15 degrees max
    const rX = -(mouseY / (height / 2)) * 12;
    const rY = (mouseX / (width / 2)) * 12;
    
    setRotate({ x: rX, y: rY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.15 }}
      className="hidden lg:block lg:col-span-5 relative w-full"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="relative w-full aspect-[4/4.2] flex items-center justify-center p-4 select-none transition-transform duration-200 ease-out"
        style={{
          transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1.02, 1.02, 1.02)`,
        }}
      >
        {/* Dynamic Dual-Color Ambient Glow: Royal Blue & Crimson Red */}
        <div className="absolute w-[85%] h-[85%] rounded-full bg-gradient-to-tr from-blue-600/20 via-red-500/10 to-amber-500/15 blur-[90px] animate-pulse pointer-events-none" />
        
        {/* Borderless Floating Character Container (Desktop View) */}
        <div className="hidden lg:flex relative w-[95%] h-[95%] overflow-visible items-center justify-center filter drop-shadow-[0_25px_30px_rgba(0,0,0,0.18)] dark:drop-shadow-[0_30px_40px_rgba(0,0,0,0.45)]">
          {(() => {
            const isWNumeric = heroImageInfo.width && !isNaN(Number(heroImageInfo.width));
            const isHNumeric = heroImageInfo.height && !isNaN(Number(heroImageInfo.height));
            if (isWNumeric && isHNumeric) {
              return (
                <Image
                  src={heroImageInfo.url}
                  alt={heroImageInfo.alt || "XmartyCreator"}
                  width={Number(heroImageInfo.width)}
                  height={Number(heroImageInfo.height)}
                  priority
                  className="object-contain w-full h-full select-none pointer-events-none"
                />
              );
            }
            return (
              <Image
                src={heroImageInfo.url}
                alt={heroImageInfo.alt || "XmartyCreator"}
                fill
                priority
                className="object-contain w-full h-full select-none pointer-events-none"
              />
            );
          })()}
        </div>

        {/* Borderless Floating Character Container (Mobile/Tablet View) */}
        <div className="flex lg:hidden relative w-[95%] h-[95%] overflow-visible items-center justify-center filter drop-shadow-[0_15px_20px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_20px_30px_rgba(0,0,0,0.35)]">
          {(() => {
            const isWNumeric = heroMobileImageInfo.width && !isNaN(Number(heroMobileImageInfo.width));
            const isHNumeric = heroMobileImageInfo.height && !isNaN(Number(heroMobileImageInfo.height));
            if (isWNumeric && isHNumeric) {
              return (
                <Image
                  src={heroMobileImageInfo.url}
                  alt={heroMobileImageInfo.alt || "XmartyCreator"}
                  width={Number(heroMobileImageInfo.width)}
                  height={Number(heroMobileImageInfo.height)}
                  priority
                  className="object-contain w-full h-full select-none pointer-events-none"
                />
              );
            }
            return (
              <Image
                src={heroMobileImageInfo.url}
                alt={heroMobileImageInfo.alt || "XmartyCreator"}
                fill
                priority
                className="object-contain w-full h-full select-none pointer-events-none"
              />
            );
          })()}
        </div>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const seoTitleBlock = useContentBlock(
    "home",
    "seo",
    "title",
    "XmartyCreator - Learn Skills that Actually Ship",
    "text"
  );
  const seoDescBlock = useContentBlock(
    "home",
    "seo",
    "description",
    "XmartyCreator helps creators learn production-grade development, build real projects, and grow with AI guidance.",
    "text"
  );
  const seoKeywordsBlock = useContentBlock(
    "home",
    "seo",
    "keywords",
    "edtech, courses, learning paths, AI guidance, engineering",
    "text"
  );

  const heroStatsBlock = useContentBlock(
    "home",
    "hero",
    "stats",
    defaultStats,
    "json"
  );

  const heroImageBlock = useContentBlock(
    "home",
    "hero",
    "image",
    "https://picsum.photos/seed/xmarty-home-lab/1100/850",
    "text"
  );

  const heroMobileImageBlock = useContentBlock(
    "home",
    "hero",
    "mobileImage",
    "https://picsum.photos/seed/xmarty-home-lab-mobile/600/800",
    "text"
  );

  const heroImageInfo = parseCmsImage(heroImageBlock.value, "https://picsum.photos/seed/xmarty-home-lab/1100/850");
  const heroMobileImageInfo = parseCmsImage(heroMobileImageBlock.value, "https://picsum.photos/seed/xmarty-home-lab-mobile/600/800");

  const titleDarkColorBlock = useContentBlock('home', 'hero', 'titleDarkColor', '', 'text');
  const subtitleDarkColorBlock = useContentBlock('home', 'hero', 'subtitleDarkColor', '', 'text');

  const primaryCtaBlock = useContentBlock('home', 'hero', 'primaryCta', 'Explore Courses', 'text');
  const secondaryCtaBlock = useContentBlock('home', 'hero', 'secondaryCta', 'Join Community', 'text');
  const loginCtaBlock = useContentBlock('home', 'hero', 'loginCta', 'Login / Register', 'text');

  const isBlockEmpty = (blockObj: any) => {
    if (blockObj.value === '') return true;
    if (blockObj.block) {
      const val = blockObj.block.value;
      if (val === null || val === undefined) return false;
      const str = String(val).trim();
      if (str === '') return true;
      const clean = str.replace(/<[^>]*>/g, '').trim();
      return clean === '' || clean === '&nbsp;';
    }
    return false;
  };

  const showPrimaryCta = !isBlockEmpty(primaryCtaBlock) || primaryCtaBlock.canEdit;
  const showSecondaryCta = !isBlockEmpty(secondaryCtaBlock) || secondaryCtaBlock.canEdit;
  const showLoginCta = !isBlockEmpty(loginCtaBlock) || loginCtaBlock.canEdit;

  const pathwaysBlock = useContentBlock(
    "home",
    "pathways",
    "items",
    defaultPathways,
    "json"
  );
  const testimonialsBlock = useContentBlock(
    "home",
    "testimonials",
    "list",
    defaultTestimonials,
    "list"
  );
  const communityFeaturesBlock = useContentBlock(
    "home",
    "community",
    "features",
    defaultCommunityFeatures,
    "json"
  );

  const communityFeatures = Array.isArray(communityFeaturesBlock.value)
    ? communityFeaturesBlock.value
    : defaultCommunityFeatures;

  const communityImageBlock = useContentBlock(
    "home",
    "community",
    "image",
    "https://picsum.photos/seed/xmarty-community-home/900/600",
    "text"
  );

  const communityImageInfo = parseCmsImage(communityImageBlock.value, "https://picsum.photos/seed/xmarty-community-home/900/600");

  const statisticItems = Array.isArray(heroStatsBlock.value)
    ? heroStatsBlock.value
    : defaultStats;

  const pathwayItems = Array.isArray(pathwaysBlock.value)
    ? pathwaysBlock.value
    : defaultPathways;

  const testimonialItems = Array.isArray(testimonialsBlock.value)
    ? testimonialsBlock.value
    : defaultTestimonials;

  const [emblaRef] = useEmblaCarousel({ loop: true, dragFree: true });

  // Testimonial submission modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [newReview, setNewReview] = useState({
    name: '',
    role: 'student',
    customRole: '',
    rating: 5,
    review: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.review) {
      alert("Please fill in Name and Review!");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const finalRole = newReview.role === 'custom' ? newReview.customRole : newReview.role;
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newReview.name,
          role: finalRole || 'student',
          rating: newReview.rating,
          review: newReview.review
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      alert("Thank you! Your testimonial has been submitted successfully.");
      setIsModalOpen(false);
      
      setNewReview({
        name: '',
        role: 'student',
        customRole: '',
        rating: 5,
        review: ''
      });
      
      window.location.reload();
    } catch (error: any) {
      alert("Submission failed: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-background">
      <title>{seoTitleBlock.value}</title>
      <meta name="description" content={seoDescBlock.value} />
      <meta name="keywords" content={seoKeywordsBlock.value} />
      <main>
        <section 
          className="relative overflow-hidden border-b bg-gradient-to-b from-background via-primary/[0.03] to-background flex flex-col justify-center min-h-[100dvh] pt-28 pb-16 lg:py-0"
          style={{
            ['--title-dark-color' as any]: titleDarkColorBlock.value || '#ffffff',
            ['--subtitle-dark-color' as any]: subtitleDarkColorBlock.value || '#cbd5e1',
          }}
        >
          {/* Ambient background glow meshes */}
          <div className="absolute top-[10%] left-[-10%] w-[35rem] h-[35rem] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[10%] right-[-5%] w-[40rem] h-[40rem] rounded-full bg-accent/10 blur-[130px] pointer-events-none" />
          
          {/* Mobile-only central background glow */}
          <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-primary/10 blur-[80px] lg:hidden pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Text & CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="lg:col-span-7 space-y-6 md:space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left relative"
              >
                <div className="badge-doodle-container inline-flex items-center justify-center gap-2.5 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary tracking-wide uppercase font-sans animate-fade-in shadow-sm shadow-primary/5 relative">
                  <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse max-md:hidden" />
                  <CustomizableBadge
                    pageSlug="home"
                    sectionKey="hero"
                    badgeKey="badge"
                    defaultText="INDUSTRY READY EDTECH"
                    className="bg-transparent border-none text-primary p-0 font-sans tracking-wider"
                  />
                  {/* Decorative hand-drawn circle for mobile */}
                  <svg className="absolute inset-0 w-full h-full text-primary/40 stroke-current stroke-[2] fill-none md:hidden pointer-events-none" viewBox="0 0 160 36" preserveAspectRatio="none">
                    <rect x="2" y="2" width="156" height="32" rx="16" strokeLinecap="round" />
                  </svg>
                </div>
                
                <div className="space-y-5 relative w-full flex flex-col items-center lg:items-start">
                  <h1 className="hero-title-container font-sans text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] relative w-full text-center lg:text-left pb-4">
                    <EditableText
                      pageSlug="home"
                      sectionKey="hero"
                      contentKey="title"
                      defaultValue="Learn skills that actually ship."
                      as="span"
                      className="text-slate-900 dark:text-white font-sans"
                    />
                    {/* Hand-drawn underline SVG overlay */}
                    <svg className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-4 text-primary/80 fill-none stroke-current stroke-[3.5] md:hidden" viewBox="0 0 100 10" preserveAspectRatio="none">
                      <path d="M 2 8 C 30 2, 70 2, 98 8 C 80 9, 40 9, 10 9" strokeLinecap="round" />
                    </svg>
                  </h1>
                  
                  <div className="hero-subtitle-container w-full max-w-2xl text-sm sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-sans font-medium pt-2 text-center lg:text-left">
                    <EditableText
                      pageSlug="home"
                      sectionKey="hero"
                      contentKey="subtitle"
                      defaultValue="XmartyCreator helps creators learn production-grade development, build real portfolio projects, and grow with AI-guided support."
                      as="span"
                      className="font-sans"
                    />
                  </div>
                </div>

                 <div className="flex flex-row flex-wrap gap-2 md:gap-4 justify-center lg:justify-start items-center relative z-10 w-full pt-2">
                  {showPrimaryCta && (
                    <Button asChild size="lg" className="h-10 md:h-14 rounded-xl md:rounded-2xl px-3 md:px-8 text-xs md:text-base font-bold bg-primary text-primary-foreground hover:bg-primary/95 shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 active:translate-y-0 font-sans z-10 w-auto shrink-0">
                      <Link href="/courses" className="inline-flex items-center">
                        <EditableText
                          pageSlug="home"
                          sectionKey="hero"
                          contentKey="primaryCta"
                          defaultValue="Explore Courses"
                          as="span"
                          className="inline-flex items-center"
                        />
                        <ArrowRight className="ml-1 md:ml-2 h-3.5 w-3.5 md:h-5 md:w-5 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  )}
                  {showSecondaryCta && (
                    <Button asChild variant="outline" size="lg" className="h-10 md:h-14 rounded-xl md:rounded-2xl border-2 border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-background/50 hover:bg-background/80 px-3 md:px-8 text-xs md:text-base font-bold transition-all hover:-translate-y-0.5 active:translate-y-0 font-sans z-10 w-auto shrink-0">
                      <Link href="/community" className="inline-flex items-center">
                        <Play className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4 fill-current" />
                        <EditableText
                          pageSlug="home"
                          sectionKey="hero"
                          contentKey="secondaryCta"
                          defaultValue="Join Community"
                          as="span"
                        />
                      </Link>
                    </Button>
                  )}
                  {showLoginCta && (
                    <Button asChild variant="secondary" size="lg" className="h-10 md:h-14 rounded-xl md:rounded-2xl px-3 md:px-8 text-xs md:text-base font-bold bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all hover:-translate-y-0.5 font-sans z-10 w-auto shrink-0">
                      <Link href="/login">
                        <EditableText
                          pageSlug="home"
                          sectionKey="hero"
                          contentKey="loginCta"
                          defaultValue="Login / Register"
                          as="span"
                        />
                      </Link>
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 pt-6 max-w-xl mx-auto lg:mx-0">
                  {statisticItems.map((item: any) => (
                    <div key={item.label} className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-background/80 p-4 shadow-sm backdrop-blur-md hover:border-primary/30 dark:hover:border-primary/40 transition-all duration-300 group">
                      <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white group-hover:text-primary transition-colors font-sans">
                        <CountUp value={item.value} />
                      </p>
                      <p className="mt-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans uppercase tracking-wider">{item.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Right Column: Multi-layered Interactive Visual Mockup with 3D Tilt */}
              <InteractiveHeroVisual heroImageInfo={heroImageInfo} heroMobileImageInfo={heroMobileImageInfo} />
            </div>
          </div>
        </section>

        <section className="flex flex-col justify-center py-16 sm:py-20 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 w-full">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="space-y-4">
                <CustomizableBadge
                  pageSlug="home"
                  sectionKey="pathways"
                  badgeKey="tag"
                  defaultText="LEARNING PATH"
                  className="border-muted/20 text-foreground"
                />
                <h2 className="font-headline text-4xl lg:text-6xl font-bold tracking-tight">
                  <EditableText
                    pageSlug="home"
                    sectionKey="pathways"
                    contentKey="heading"
                    defaultValue="Everything connects."
                    as="span"
                  />
                </h2>
              </div>
              <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
                <EditableText
                  pageSlug="home"
                  sectionKey="pathways"
                  contentKey="subtitle"
                  defaultValue="Courses, AI guidance, community practice, and career readiness work together instead of feeling scattered."
                  as="span"
                  className="text-lg leading-relaxed"
                />
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              {pathwayItems.map((item: any) => {
                const Icon =
                  typeof item.icon === "string"
                    ? (({
                        BookOpen,
                        BrainCircuit,
                        Users,
                        BriefcaseBusiness,
                      } as Record<string, any>)[item.icon] ?? BookOpen)
                    : item.icon ?? BookOpen;

                return (
                  <Link href={item.link || "/courses"} key={item.title} className="block group w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] max-w-sm">
                    <Card className="h-full border-muted/5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl rounded-[2rem] group-hover:border-primary/20">
                      <CardContent className="p-7 space-y-5">
                        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-muted/10 text-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all duration-350">
                          <Icon className="h-7 w-7" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-headline text-2xl font-bold leading-tight group-hover:text-primary transition-colors duration-300" dangerouslySetInnerHTML={{ __html: item.title }} />
                          <p className="text-sm leading-relaxed text-muted-foreground" dangerouslySetInnerHTML={{ __html: item.description || item.desc }} />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured courses removed */}

        <section className="flex flex-col justify-center py-12 sm:py-16 lg:py-20 bg-muted/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="rounded-2xl bg-background p-6 md:p-8 shadow-xl border border-primary/5 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
              <div className="space-y-4 text-center lg:text-left">
                <CustomizableBadge
                  pageSlug="home"
                  sectionKey="community"
                  badgeKey="badge"
                  defaultText="COMMUNITY POWER"
                  className="border-primary/20 text-primary text-xs px-2.5 py-0.5"
                />
                <h2 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                  <EditableText
                    pageSlug="home"
                    sectionKey="community"
                    contentKey="heading"
                    defaultValue="You do not learn alone here."
                    as="span"
                  />
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  <EditableText
                    pageSlug="home"
                    sectionKey="community"
                    contentKey="subtitle"
                    defaultValue="Get discussions, live reviews, creator circles, and launch updates so your learning keeps moving after every lesson."
                    as="span"
                    className="text-sm sm:text-base leading-relaxed"
                  />
                </p>
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                  {communityFeatures.map((item: any, idx: number) => {
                    const IconComponent = typeof item.icon === 'string' ? (iconMap[item.icon] ?? MessageSquare) : (item.icon ?? MessageSquare);
                    return (
                      <div key={idx} className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 bg-background shadow-sm hover:border-primary/20 transition-colors shrink-0">
                        <IconComponent className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-bold text-foreground">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="pt-2 flex justify-center lg:justify-start">
                  <Button asChild variant="outline" size="sm" className="h-11 rounded-xl border-2 px-6 font-bold">
                    <Link href="/community">
                      <EditableText
                        pageSlug="home"
                        sectionKey="community"
                        contentKey="cta"
                        defaultValue="Explore Community"
                        as="span"
                      />
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div 
                className="relative overflow-hidden rounded-[2rem] flex items-center justify-center"
                style={{ aspectRatio: (!communityImageInfo.width && !communityImageInfo.height) ? '16/9' : undefined }}
              >
                {(() => {
                  const isWNumeric = communityImageInfo.width && !isNaN(Number(communityImageInfo.width));
                  const isHNumeric = communityImageInfo.height && !isNaN(Number(communityImageInfo.height));
                  if (isWNumeric && isHNumeric) {
                    return (
                      <Image
                        src={communityImageInfo.url}
                        alt={communityImageInfo.alt || "XmartyCreator community session"}
                        width={Number(communityImageInfo.width)}
                        height={Number(communityImageInfo.height)}
                        className="object-cover rounded-[2rem]"
                      />
                    );
                  }
                  if (!communityImageInfo.width && !communityImageInfo.height) {
                    return (
                      <Image
                        src={communityImageInfo.url}
                        alt={communityImageInfo.alt || "XmartyCreator community session"}
                        fill
                        className="object-cover w-full h-full"
                      />
                    );
                  }
                  return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={communityImageInfo.url}
                      alt={communityImageInfo.alt || "XmartyCreator community session"}
                      style={{
                        width: communityImageInfo.width ? (isNaN(Number(communityImageInfo.width)) ? communityImageInfo.width : `${communityImageInfo.width}px`) : 'auto',
                        height: communityImageInfo.height ? (isNaN(Number(communityImageInfo.height)) ? communityImageInfo.height : `${communityImageInfo.height}px`) : 'auto',
                      }}
                      className="rounded-[2rem] object-cover"
                    />
                  );
                })()}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="flex flex-col justify-center py-16 sm:py-20 lg:py-24 bg-muted/10 border-t border-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 w-full">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <CustomizableBadge
                pageSlug="home"
                sectionKey="testimonials"
                badgeKey="badge"
                defaultText="STUDENT REVIEWS"
                className="border-primary/20 text-primary px-4 py-1 text-sm font-semibold rounded-full animate-pulse"
              />
              <h2 className="font-headline text-4xl lg:text-6xl font-bold tracking-tight">
                <EditableText
                  pageSlug="home"
                  sectionKey="testimonials"
                  contentKey="heading"
                  defaultValue="What our students say"
                  as="span"
                />
              </h2>
              <p className="text-lg text-muted-foreground">
                <EditableText
                  pageSlug="home"
                  sectionKey="testimonials"
                  contentKey="subtitle"
                  defaultValue="Real reviews from creators who built real projects."
                  as="span"
                  className="text-lg text-muted-foreground"
                />
              </p>
            </div>

            {/* Drag & swipeable Embla Carousel wrapper */}
            <div className="embla overflow-hidden cursor-grab active:cursor-grabbing px-4 py-8" ref={emblaRef}>
              <div className="embla__container flex gap-6">
                {testimonialItems.map((item: any, idx: number) => {
                  const avatarInfo = parseCmsImage(item.avatar, "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=crop&w=150&h=150");
                  const starsCount = Number(item.rating) || 5;

                  return (
                    <div className="embla__slide flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_33.33%] min-w-0" key={idx}>
                      <Card className="h-full border-primary/5 bg-background/50 backdrop-blur-xl shadow-lg hover:-translate-y-1.5 transition-all duration-300 rounded-[1.75rem] overflow-hidden flex flex-col justify-between p-6">
                        <div className="space-y-4">
                          <div className="flex gap-1 text-amber-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < starsCount ? 'fill-current' : 'opacity-30'}`} />
                            ))}
                          </div>
                          <p className="text-base leading-relaxed text-foreground/90 italic">
                            "{item.review}"
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-primary/5">
                          <div 
                            className="relative rounded-full overflow-hidden flex items-center justify-center bg-muted border border-primary/10"
                            style={{ 
                              width: avatarInfo.width ? `${avatarInfo.width}px` : '48px', 
                              height: avatarInfo.height ? `${avatarInfo.height}px` : '48px',
                              minWidth: '48px',
                              minHeight: '48px'
                            }}
                          >
                            <Image
                              src={avatarInfo.url}
                              alt={avatarInfo.alt || item.name}
                              fill={!avatarInfo.width && !avatarInfo.height}
                              width={avatarInfo.width ? Number(avatarInfo.width) : undefined}
                              height={avatarInfo.height ? Number(avatarInfo.height) : undefined}
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-bold text-base text-foreground leading-tight">{item.name}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.role}</p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Testimonial Action CTA */}
            <div className="flex justify-center pt-2">
              <Button 
                onClick={() => setIsModalOpen(true)}
                variant="outline"
                size="lg"
                className="h-14 rounded-2xl border-2 border-primary/20 hover:border-primary px-8 font-bold hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-lg shadow-primary/5"
              >
                + Write a Testimonial
              </Button>
            </div>

            {/* Premium Submission Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
                <div className="bg-background border border-primary/10 rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
                  <div className="space-y-2">
                    <h3 className="font-headline text-3xl font-bold">Write a Testimonial</h3>
                    <p className="text-sm text-muted-foreground">Share your learning journey and feedback with the community.</p>
                  </div>

                  <form onSubmit={handleTestimonialSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Your Name</label>
                      <Input
                        value={newReview.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewReview(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Rahul Sharma"
                        required
                        className="h-12 rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Your Role</label>
                        <div className="relative" ref={dropdownRef}>
                          <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full h-12 rounded-xl border border-input bg-background px-4 flex items-center justify-between text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer select-none"
                          >
                            <span className="capitalize">
                              {newReview.role === 'custom' ? (newReview.customRole || 'Custom...') : newReview.role}
                            </span>
                            <span className="text-muted-foreground text-xs">▼</span>
                          </button>
                          
                          {isDropdownOpen && (
                            <div className="absolute left-0 right-0 mt-1.5 z-[60] bg-popover text-popover-foreground border border-border shadow-xl rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                              <button
                                type="button"
                                onClick={() => { setNewReview(prev => ({ ...prev, role: 'student' })); setIsDropdownOpen(false); }}
                                className="w-full text-left px-4 py-3 text-sm hover:bg-primary/5 transition-colors cursor-pointer"
                              >
                                Student
                              </button>
                              <button
                                type="button"
                                onClick={() => { setNewReview(prev => ({ ...prev, role: 'visitor' })); setIsDropdownOpen(false); }}
                                className="w-full text-left px-4 py-3 text-sm hover:bg-primary/5 transition-colors cursor-pointer"
                              >
                                Visitor
                              </button>
                              <button
                                type="button"
                                onClick={() => { setNewReview(prev => ({ ...prev, role: 'custom' })); setIsDropdownOpen(false); }}
                                className="w-full text-left px-4 py-3 text-sm hover:bg-primary/5 transition-colors cursor-pointer"
                              >
                                Custom...
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Rating</label>
                        <div className="flex items-center gap-1.5 h-12 text-amber-500">
                          {[1, 2, 3, 4, 5].map((starValue) => (
                            <button
                              key={starValue}
                              type="button"
                              onClick={() => setNewReview(prev => ({ ...prev, rating: starValue }))}
                              className="focus:outline-none transition-transform hover:scale-110"
                            >
                              <Star className={`h-6 w-6 ${starValue <= newReview.rating ? 'fill-current' : 'opacity-30'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {newReview.role === 'custom' && (
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Custom Role Name</label>
                        <Input
                          value={newReview.customRole}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewReview(prev => ({ ...prev, customRole: e.target.value }))}
                          placeholder="e.g. Backend Dev @ Razorpay"
                          required
                          className="h-12 rounded-xl"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Your Review</label>
                      <Textarea
                        value={newReview.review}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewReview(prev => ({ ...prev, review: e.target.value }))}
                        placeholder="Tell us what you built or learned here..."
                        required
                        className="min-h-[100px] rounded-xl"
                      />
                    </div>

                    <div className="flex gap-3 justify-end pt-4">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsModalOpen(false)}
                        className="h-12 rounded-xl px-5 font-bold"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-12 rounded-xl px-6 font-bold bg-primary text-primary-foreground hover:bg-primary/95"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Testimonial'}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
