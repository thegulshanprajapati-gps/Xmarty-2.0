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

  const heroImageInfo = parseCmsImage(heroImageBlock.value, "https://picsum.photos/seed/xmarty-home-lab/1100/850");

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
        <section className="relative overflow-hidden border-b bg-muted/20 flex flex-col justify-center py-16 sm:py-20 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-[1.02fr_0.98fr] gap-14 lg:gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8 text-center lg:text-left"
              >
                <CustomizableBadge
                  pageSlug="home"
                  sectionKey="hero"
                  badgeKey="badge"
                  defaultText="INDUSTRY READY EDTECH"
                  className="border-muted/20 text-foreground"
                />
                <div className="space-y-4">
                  <h1 className="font-headline text-4xl sm:text-6xl lg:text-8xl font-bold tracking-tight leading-[0.95]">
                    <EditableText
                      pageSlug="home"
                      sectionKey="hero"
                      contentKey="title"
                      defaultValue="Learn skills that actually ship."
                      as="span"
                    />
                  </h1>
                  <div className="mx-auto max-w-2xl text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed lg:mx-0">
                    <EditableText
                      pageSlug="home"
                      sectionKey="hero"
                      contentKey="subtitle"
                      defaultValue="XmartyCreator helps creators learn production-grade development, build real portfolio projects, and grow with AI-guided support."
                      as="span"
                      className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed"
                    />
                  </div>
                </div>
                 <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  {showPrimaryCta && (
                    <Button asChild size="lg" className="h-11 sm:h-14 rounded-xl sm:rounded-2xl px-6 sm:px-8 text-sm sm:text-base font-bold shadow-xl shadow-muted/20">
                      <Link href="/courses">
                        <EditableText
                          pageSlug="home"
                          sectionKey="hero"
                          contentKey="primaryCta"
                          defaultValue="Explore Courses"
                          as="span"
                          className="inline-flex items-center"
                        />
                        <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                      </Link>
                    </Button>
                  )}
                  {showSecondaryCta && (
                    <Button asChild variant="outline" size="lg" className="h-11 sm:h-14 rounded-xl sm:rounded-2xl border-2 px-6 sm:px-8 text-sm sm:text-base font-bold">
                      <Link href="/community">
                        <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
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
                    <Button asChild variant="secondary" size="lg" className="h-11 sm:h-14 rounded-xl sm:rounded-2xl px-6 sm:px-8 text-sm sm:text-base font-bold">
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
                <div className="grid grid-cols-3 gap-3 pt-4">
                  {statisticItems.map((item: any) => (
                    <div key={item.label} className="rounded-2xl border bg-background/80 p-4 shadow-sm">
                      <p className="text-2xl sm:text-3xl font-bold text-foreground">
                        <CountUp value={item.value} />
                      </p>
                      <p className="mt-1 text-xs sm:text-sm font-medium text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="hidden lg:block relative"
              >
                <div 
                  className="relative overflow-hidden rounded-[3rem] border-[10px] border-background shadow-2xl flex items-center justify-center"
                  style={{ aspectRatio: (!heroImageInfo.width && !heroImageInfo.height) ? '4/3' : undefined }}
                >
                  {(() => {
                    const isWNumeric = heroImageInfo.width && !isNaN(Number(heroImageInfo.width));
                    const isHNumeric = heroImageInfo.height && !isNaN(Number(heroImageInfo.height));
                    if (isWNumeric && isHNumeric) {
                      return (
                        <Image
                          src={heroImageInfo.url}
                          alt={heroImageInfo.alt || "XmartyCreator learners building software together"}
                          width={Number(heroImageInfo.width)}
                          height={Number(heroImageInfo.height)}
                          priority
                          className="object-cover rounded-[3rem]"
                        />
                      );
                    }
                    if (!heroImageInfo.width && !heroImageInfo.height) {
                      return (
                        <Image
                          src={heroImageInfo.url}
                          alt={heroImageInfo.alt || "XmartyCreator learners building software together"}
                          fill
                          priority
                          className="object-cover w-full h-full"
                        />
                      );
                    }
                    return (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={heroImageInfo.url}
                        alt={heroImageInfo.alt || "XmartyCreator learners building software together"}
                        style={{
                          width: heroImageInfo.width ? (isNaN(Number(heroImageInfo.width)) ? heroImageInfo.width : `${heroImageInfo.width}px`) : 'auto',
                          height: heroImageInfo.height ? (isNaN(Number(heroImageInfo.height)) ? heroImageInfo.height : `${heroImageInfo.height}px`) : 'auto',
                        }}
                        className="rounded-[3rem] object-cover"
                      />
                    );
                  })()}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-6 sm:p-8 text-white">
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 backdrop-blur">
                        <Sparkles className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">
                          <EditableText
                            pageSlug="home"
                            sectionKey="hero"
                            contentKey="imageBadgeTitle"
                            defaultValue="Vasant AI Mentor"
                            as="span"
                          />
                        </p>
                        <p className="text-sm text-white/75">
                          <EditableText
                            pageSlug="home"
                            sectionKey="hero"
                            contentKey="imageBadgeSubtitle"
                            defaultValue="Always-on help for your learning path."
                            as="span"
                          />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
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
