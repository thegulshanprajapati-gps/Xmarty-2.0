'use client';

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock, User, ArrowLeft, ArrowRight, Share2, Copy, Send, Star, MessageSquare, BookOpen, Link2, Eye, ShieldAlert, Sparkles, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";

// ─── Premium Magazine Loader ─────────────────────────────────────────────────
function MagazineLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="relative flex flex-col items-center gap-8 select-none">
        <div className="relative w-44 h-32 perspective-1000">
          <div className="absolute inset-0 rounded-xl border border-red-200/30 dark:border-red-900/30 bg-gradient-to-br from-red-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 shadow-xl" style={{ transform: 'rotate(-6deg) translateX(-6px)', transformOrigin: 'left center' }} />
          <div className="absolute inset-0 rounded-xl border border-red-200/40 dark:border-red-900/40 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 shadow-lg" style={{ transform: 'rotate(-2deg) translateX(-2px)', transformOrigin: 'left center', animation: 'pageFlutter 2.4s ease-in-out infinite' }}>
            <div className="p-5 space-y-2.5 opacity-40">
              <div className="h-2 w-3/4 bg-current rounded-full animate-pulse" />
              <div className="h-1.5 w-full bg-current rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
              <div className="h-1.5 w-5/6 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="h-1.5 w-4/5 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>
          <div className="absolute inset-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden" style={{ animation: 'pageLift 2.4s ease-in-out infinite' }}>
            <div className="h-full w-full bg-gradient-to-br from-white via-red-50/30 to-white dark:from-slate-900 dark:to-slate-800 p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <div className="h-1.5 w-16 bg-red-200 dark:bg-red-900/40 rounded-full" />
              </div>
              <div className="h-2.5 w-5/6 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
              <div className="h-2 w-4/5 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-sm font-bold tracking-wide text-slate-500 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-red-500 animate-bounce" /> Loading Dynamic Journal...
          </span>
        </div>
      </div>
      <style>{`
        @keyframes pageLift { 0%, 100% { transform: rotateY(0deg) translateX(0); } 40% { transform: rotateY(-15deg) translateX(4px); } 60% { transform: rotateY(-8deg) translateX(2px); } }
        @keyframes pageFlutter { 0%, 100% { transform: rotate(-2deg) translateX(-2px); } 40% { transform: rotate(-8deg) translateX(-6px); } 60% { transform: rotate(-4deg) translateX(-3px); } }
        .perspective-1000 { perspective: 1000px; }
      `}</style>
    </div>
  );
}

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Review states
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerComment, setReviewerComment] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);

  // Sibling navigation
  const [prevPost, setPrevPost] = useState<any>(null);
  const [nextPost, setNextPost] = useState<any>(null);

  // Related posts
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);

  // Font size configuration for reader accessibility
  const [fontSizeClass, setFontSizeClass] = useState<'text-sm' | 'text-base' | 'text-lg' | 'text-xl'>('text-base');

  useEffect(() => {
    const loadBlogData = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/blogs');
        if (!res.ok) {
          setBlog(null);
          setLoading(false);
          return;
        }

        const data = await res.json();
        setBlogs(data);

        const currentIndex = data.findIndex(
          (b: any) => b.slug === params.slug || b.id === params.slug
        );

        if (currentIndex !== -1) {
          const found = data[currentIndex];
          setBlog(found);

          // Set siblings
          setPrevPost(currentIndex > 0 ? data[currentIndex - 1] : null);
          setNextPost(currentIndex < data.length - 1 ? data[currentIndex + 1] : null);

          // Set related posts (filter current and choose other 2)
          const filtered = data.filter((b: any) => b.id !== found.id).slice(0, 2);
          setRelatedPosts(filtered);

          // Load reviews from DB
          fetch(`/api/blogs/comments?blogId=${found.id || found.slug}`)
            .then(r => r.json())
            .then(data => {
              if (Array.isArray(data)) setReviews(data);
            })
            .catch(e => console.error("Failed to load reviews from DB:", e));

          // Increment and fetch views from DB
          fetch('/api/blogs/views', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ blogId: found.id || found.slug })
          })
            .then(r => r.json())
            .then(data => {
              if (data.success) setViewsCount(data.views);
            })
            .catch(() => {});

          // Track page view telemetry
          fetch('/api/security/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ route: `/blog/${found.slug || found.id}`, renderTime: 1 })
          }).catch(() => {});
        } else {
          setBlog(null);
        }
      } catch (e) {
        console.error('Failed to load blog details:', e);
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };
    loadBlogData();
  }, [params.slug]);

  // Update Page Title / Tab Name dynamically based on loaded article
  useEffect(() => {
    if (typeof window !== 'undefined' && blog) {
      const cleanTitle = (blog.title || '').replace(/<[^>]*>/g, '').trim();
      document.title = `${cleanTitle} | Insight Journal`;
    }
  }, [blog]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link Copied", description: "Article URL copied to clipboard!" });
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewerComment.trim()) {
      toast({ variant: "destructive", title: "Missing details", description: "Please enter your name and comment." });
      return;
    }

    try {
      const res = await fetch('/api/blogs/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blogId: blog.id || blog.slug,
          blogTitle: blog.title,
          blogSlug: blog.slug,
          name: reviewerName,
          comment: reviewerComment,
          rating
        })
      });

      if (!res.ok) {
        throw new Error("Failed to submit comment to database");
      }

      const data = await res.json();
      if (data.success) {
        setReviews(prev => [data.comment, ...prev]);
        setReviewerName('');
        setReviewerComment('');
        setRating(5);
        toast({ title: "Review Submitted", description: "Thank you for reviewing this post!" });
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Submission Failed", description: e.message || "Failed to save comment." });
    }
  };

  // Compile Table of Contents dynamically from Heading blocks
  const headings = useMemo(() => {
    if (!blog?.blocks || !Array.isArray(blog.blocks)) {
      // Fallback parser if legacy content is stored as html
      if (blog?.content) {
        const list: string[] = [];
        const regex = /<h[234][^>]*>(.*?)<\/h[234]>/g;
        let match;
        while ((match = regex.exec(blog.content)) !== null) {
          list.push(match[1].replace(/<[^>]*>/g, '').trim());
        }
        return list;
      }
      return [];
    }
    return blog.blocks
      .filter((b: any) => b.type === 'heading')
      .map((b: any) => b.content || '');
  }, [blog]);

  // Structured Article JSON-LD Schema
  const jsonLd = useMemo(() => {
    if (!blog) return null;
    return {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": blog.title,
      "image": [blog.image],
      "datePublished": blog.created_at || new Date().toISOString(),
      "dateModified": blog.updated_at || new Date().toISOString(),
      "author": [{
        "@type": "Person",
        "name": blog.author || "Admin",
        "url": "https://xmartycreator.com"
      }]
    };
  }, [blog]);

  if (loading) {
    return <MagazineLoader />;
  }

  if (!blog) {
    return (
      <div className="w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#030712] px-4 text-center py-24 space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center">
          <BookOpen className="h-10 w-10 text-red-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-headline font-black text-slate-950 dark:text-white">Article Not Found</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
            The blog post you are looking for does not exist, has been moved, or was permanently deleted.
          </p>
        </div>
        <Button asChild className="bg-red-500 hover:bg-red-600 text-white rounded-xl h-11 px-6 font-bold">
          <Link href="/blog" className="text-white hover:text-white flex items-center">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Journal
          </Link>
        </Button>
      </div>
    );
  }

  // Fallback Configs
  const fontConfig = blog.fontConfig || {
    heading_font: "Poppins",
    body_font: "Inter",
    hindi_font: "Noto Sans Devanagari",
    quote_font: "Playfair Display"
  };

  const sidebarConfig = blog.sidebarConfig || [
    { type: 'share', enabled: true },
    { type: 'author', enabled: true },
    { type: 'toc', enabled: true },
    { type: 'related', enabled: true },
    { type: 'trending', enabled: true }
  ];

  // Dynamic Quote Renderer
  const renderQuoteBlock = (block: any) => {
    const quoteStyle = block.quote_style || 'left-border';
    const text = block.content || block.quote_text || '';
    const align = block.alignment || 'left';
    const hasIcon = block.enable_icon !== false;
    const accent = block.accent_color || '#ef4444';

    const alignmentClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

    switch (quoteStyle) {
      case 'glass':
        return (
          <div className={`backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20 rounded-2xl p-6 shadow-xl my-6 ${alignmentClass}`}>
            {hasIcon && <span className="text-4xl text-primary/40 block mb-2 font-serif">“</span>}
            <blockquote className="text-lg font-medium italic dynamic-quote leading-relaxed" style={{ color: accent }}>
              {text}
            </blockquote>
          </div>
        );
      case 'elegant':
        return (
          <div className={`border-y border-border py-6 my-6 italic dynamic-quote ${alignmentClass}`}>
            <blockquote className="text-xl leading-relaxed text-slate-800 dark:text-slate-200">
              "{text}"
            </blockquote>
          </div>
        );
      case 'motivational':
        return (
          <div className="bg-gradient-to-r from-amber-500/10 to-rose-500/10 border-l-4 border-amber-500 rounded-xl p-5 text-amber-900 dark:text-yellow-300 font-bold my-6">
            <blockquote className={`text-base leading-relaxed ${alignmentClass}`}>
              {text}
            </blockquote>
          </div>
        );
      case 'centered':
        return (
          <div className="text-center max-w-2xl mx-auto my-8 space-y-2">
            {hasIcon && <span className="text-5xl text-amber-500/50 block font-serif">“</span>}
            <blockquote className="text-2xl font-extrabold italic dynamic-quote leading-relaxed text-foreground">
              {text}
            </blockquote>
          </div>
        );
      case 'colored':
        return (
          <div className="rounded-xl p-5 border my-6" style={{ backgroundColor: `${accent}0a`, borderColor: `${accent}30` }}>
            <blockquote className={`text-base font-semibold leading-relaxed ${alignmentClass}`} style={{ color: accent }}>
              {text}
            </blockquote>
          </div>
        );
      case 'left-border':
      default:
        return (
          <div className="border-l-4 border-red-500 pl-4 py-2 my-6 bg-red-500/5 rounded-r-xl">
            <blockquote className={`text-base font-medium italic text-slate-700 dark:text-slate-300 leading-relaxed ${alignmentClass}`}>
              "{text}"
            </blockquote>
          </div>
        );
    }
  };

  // Dynamic Block Builder Renderer
  const renderBlock = (block: any, idx: number) => {
    switch (block.type) {
      case 'heading':
        const Tag = block.level === 'h1' ? 'h1' : block.level === 'h3' ? 'h3' : block.level === 'h4' ? 'h4' : 'h2';
        const classes = 
          Tag === 'h1' ? 'text-3xl sm:text-4xl font-black mt-8 mb-4' : 
          Tag === 'h3' ? 'text-xl sm:text-2xl font-bold mt-6 mb-3' : 
          Tag === 'h4' ? 'text-lg sm:text-xl font-bold mt-4 mb-2' : 
          'text-2xl sm:text-3xl font-extrabold mt-8 mb-4 border-b border-border pb-1';
        return (
          <Tag 
            key={idx} 
            className={`font-headline text-foreground dynamic-heading ${classes}`}
            id={block.content ? encodeURIComponent(block.content.replace(/\s+/g, '-')) : String(idx)}
          >
            {block.content}
          </Tag>
        );

      case 'paragraph':
        return (
          <p key={idx} className={`text-foreground/80 leading-relaxed mb-4 dynamic-body ${fontSizeClass}`}>
            {block.content}
          </p>
        );

      case 'quote':
        return <div key={idx}>{renderQuoteBlock(block)}</div>;

      case 'image':
      case 'image-caption':
        return (
          <div key={idx} className="my-6 space-y-2 text-center">
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border shadow-sm">
              <img src={block.url || block.image_url} alt={block.caption || "Article media"} className="w-full h-full object-cover" />
            </div>
            {block.caption && (
              <span className="text-xs text-muted-foreground italic block">{block.caption}</span>
            )}
          </div>
        );

      case 'bullet-list':
        return (
          <ul key={idx} className="list-disc pl-6 space-y-1.5 mb-4 text-foreground/80 dynamic-body">
            {Array.isArray(block.items) ? block.items.map((it: string, k: number) => (
              <li key={k}>{it}</li>
            )) : <li dangerouslySetInnerHTML={{ __html: block.content }} />}
          </ul>
        );

      case 'numbered-list':
        return (
          <ol key={idx} className="list-decimal pl-6 space-y-1.5 mb-4 text-foreground/80 dynamic-body">
            {Array.isArray(block.items) ? block.items.map((it: string, k: number) => (
              <li key={k}>{it}</li>
            )) : <li dangerouslySetInnerHTML={{ __html: block.content }} />}
          </ol>
        );

      case 'highlight':
      case 'callout':
        return (
          <div key={idx} className="bg-primary/5 border border-primary/20 rounded-xl p-4 my-6 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-foreground/90 leading-relaxed dynamic-body">
              {block.content}
            </p>
          </div>
        );

      case 'key-points':
        return (
          <div key={idx} className="border border-border rounded-xl p-5 my-6 bg-slate-50 dark:bg-slate-900/30">
            <h4 className="text-sm font-extrabold uppercase tracking-widest text-muted-foreground mb-3">Key Highlights</h4>
            <ul className="space-y-2.5 text-sm font-semibold text-foreground/80 dynamic-body">
              {Array.isArray(block.items) ? block.items.map((pt: string, k: number) => (
                <li key={k} className="flex gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{pt}</span>
                </li>
              )) : <li>{block.content}</li>}
            </ul>
          </div>
        );

      case 'code':
        return (
          <pre key={idx} className="bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto my-6 border border-slate-800">
            <code>{block.content}</code>
          </pre>
        );

      case 'divider':
        return <hr key={idx} className="border-t border-border my-8" />;

      case 'video':
        return (
          <div key={idx} className="my-6 aspect-video rounded-xl overflow-hidden shadow-sm border border-border">
            <iframe
              src={block.url || block.video_url}
              className="w-full h-full"
              allowFullScreen
              title="Embedded Video Player"
            />
          </div>
        );

      case 'table':
        return (
          <div key={idx} className="my-6 overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-muted border-b border-border">
                <tr>
                  {block.headers?.map((h: string, k: number) => (
                    <th key={k} className="p-3 font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {block.rows?.map((row: string[], rk: number) => (
                  <tr key={rk}>
                    {row.map((cell: string, ck: number) => (
                      <td key={ck} className="p-3 text-foreground/85">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'faq':
        return (
          <div key={idx} className="border border-border rounded-xl p-5 my-6 bg-slate-50 dark:bg-slate-900/30 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b pb-2">Frequently Asked Questions</h4>
            {block.items?.map((it: any, k: number) => (
              <div key={k} className="space-y-1">
                <p className="font-bold text-sm text-foreground">{it.question}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{it.answer}</p>
              </div>
            ))}
          </div>
        );

      case 'conclusion':
        return (
          <div key={idx} className="border-t border-primary/20 pt-6 my-6 space-y-2">
            <h4 className="font-headline font-black text-xl text-primary">Conclusion</h4>
            <p className="text-foreground/80 leading-relaxed dynamic-body italic font-semibold">
              {block.content}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  // Sidebar widgets rendering helper
  const renderSidebarWidget = (widget: any) => {
    if (!widget.enabled) return null;

    switch (widget.type) {
      case 'share':
        return (
          <Card key={widget.type} className="border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
            <CardHeader className="p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-primary" />
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Share Article</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5 flex flex-col gap-3">
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-input bg-muted/30 hover:bg-primary/5 hover:border-primary/30 text-xs font-semibold text-foreground/80 transition-all text-left"
              >
                <span>Copy Link URL</span>
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <div className="grid grid-cols-3 gap-2">
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center p-2 rounded-xl border border-input bg-muted/30 hover:bg-muted text-foreground/80 text-xs font-bold gap-1.5 transition-colors">X</a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center p-2 rounded-xl border border-input bg-muted/30 hover:bg-muted text-foreground/80 text-xs font-bold gap-1.5 transition-colors">LI</a>
                <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(blog.title)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center p-2 rounded-xl border border-input bg-muted/30 hover:bg-muted text-foreground/80 text-xs font-bold gap-1.5 transition-colors">WA</a>
              </div>
            </CardContent>
          </Card>
        );

      case 'author':
        return (
          <Card key={widget.type} className="border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
            <CardHeader className="p-5 border-b border-border">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">About The Author</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                  {blog.author?.charAt(0) || 'A'}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground" dangerouslySetInnerHTML={{ __html: blog.author || 'Admin' }} />
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">Journal Contributor</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Expert educator and curriculum creator mapping placement preparatory programs and technology concepts.
              </p>
            </CardContent>
          </Card>
        );

      case 'toc':
        if (headings.length === 0) return null;
        return (
          <Card key={widget.type} className="border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
            <CardHeader className="p-5 border-b border-border">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Table of Contents</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <nav className="space-y-2.5">
                {headings.map((head: string, idx: number) => (
                  <div 
                    key={idx} 
                    onClick={() => {
                      const el = document.getElementById(encodeURIComponent(head.replace(/\s+/g, '-')));
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 cursor-pointer group"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/40 group-hover:bg-primary group-hover:scale-125 transition-all shrink-0" />
                    <span className="group-hover:translate-x-0.5 transition-transform">{head}</span>
                  </div>
                ))}
              </nav>
            </CardContent>
          </Card>
        );

      case 'related':
        if (relatedPosts.length === 0) return null;
        return (
          <Card key={widget.type} className="border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
            <CardHeader className="p-5 border-b border-border">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Related Articles</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {relatedPosts.map((post) => (
                <Link href={`/blog/${post.slug || post.id}`} key={post.id} className="flex gap-3 items-center group">
                  <div className="relative h-12 w-16 rounded-lg overflow-hidden shrink-0 bg-muted border border-border">
                    <img src={post.image || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=100&q=80'} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">{post.title}</h4>
                    <span className="inline-block text-[9px] text-primary font-bold uppercase tracking-wider mt-1 bg-primary/10 px-1.5 py-0.5 rounded">{post.category}</span>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        );

      case 'trending':
        return (
          <Card key={widget.type} className="border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
            <div className="bg-primary/10 px-5 py-4 flex items-center gap-2 border-b border-primary/20">
              <span className="text-base animate-pulse">🔥</span>
              <h3 className="text-xs font-bold text-primary uppercase tracking-widest">Trending Insights</h3>
            </div>
            <CardContent className="p-0 divide-y divide-border">
              {blogs.slice(0, 4).map((post) => (
                <Link href={`/blog/${post.slug || post.id}`} key={post.id} className="block px-5 py-4 hover:bg-muted/40 transition-all duration-205 group">
                  <p className="text-xs font-semibold text-foreground/80 group-hover:text-primary transition-colors line-clamp-2 leading-relaxed">{post.title}</p>
                </Link>
              ))}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground transition-colors duration-300 relative pb-16">
      {/* Schema injection */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* Dynamic Font Configuration Injector */}
      {fontConfig && (
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontConfig.heading_font || 'Poppins')}:wght@400;700;900&family=${encodeURIComponent(fontConfig.body_font || 'Inter')}:wght@400;500;750&family=${encodeURIComponent(fontConfig.hindi_font || 'Noto Sans Devanagari')}:wght@400;700&family=${encodeURIComponent(fontConfig.quote_font || 'Playfair Display')}:ital,wght@0,400;0,700;1,400&display=swap');
          .dynamic-heading { font-family: '${fontConfig.heading_font || 'Poppins'}', '${fontConfig.hindi_font || 'Noto Sans Devanagari'}', sans-serif; }
          .dynamic-body { font-family: '${fontConfig.body_font || 'Inter'}', '${fontConfig.hindi_font || 'Noto Sans Devanagari'}', sans-serif; }
          .dynamic-quote { font-family: '${fontConfig.quote_font || 'Playfair Display'}', serif; }
        `}</style>
      )}

      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.04)_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

      {/* Sticky Top Header Navigation */}
      <div className="sticky top-20 z-30 w-full bg-background/80 backdrop-blur-md border-b border-border py-3.5 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-primary pl-0 h-auto py-1 font-bold text-xs transition-colors duration-200">
            <Link href="/blog" className="flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back to Journal
            </Link>
          </Button>

          {/* Reader font-size adjustment controls */}
          <div className="flex gap-1 items-center border rounded-xl p-1 bg-muted/40">
            {(['text-sm', 'text-base', 'text-lg', 'text-xl'] as const).map((sz) => (
              <button
                key={sz}
                onClick={() => setFontSizeClass(sz)}
                className={`px-2 py-1 text-[10px] font-extrabold rounded-lg uppercase transition-all ${
                  fontSizeClass === sz 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {sz.replace('text-', '')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Article Hero Grid Section (Matching Image 1 layouts) */}
      <div className="bg-muted/5 border-b border-border py-12 mb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Details */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Link href="/" className="hover:underline">Home</Link>
                <ChevronRight className="h-3 w-3" />
                <Link href="/blog" className="hover:underline">Blog</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="truncate max-w-[200px]">{blog.title}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {blog.category && (
                  <Badge className="bg-primary/10 text-primary border border-primary/20 font-bold uppercase text-[9px] py-1 px-3.5 rounded-full">
                    {blog.category}
                  </Badge>
                )}
                {blog.featured && (
                  <Badge className="bg-amber-500 text-slate-950 border-none font-bold uppercase text-[9px] py-1 px-3.5 rounded-full">
                    Featured
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground leading-tight tracking-tight dynamic-heading">
                {blog.title}
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground font-medium leading-relaxed dynamic-body">
                {blog.excerpt}
              </p>

              {/* Author / Date Strip */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs sm:text-sm text-muted-foreground pt-4 border-t border-border/80">
                <span className="flex items-center gap-2 text-foreground/80 font-bold">
                  <User className="h-4 w-4 text-primary" />
                  <span dangerouslySetInnerHTML={{ __html: blog.author || 'Admin' }} />
                </span>
                <span className="text-border">•</span>
                <span className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {blog.date}
                </span>
                <span className="text-border">•</span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {blog.readTime || '3 min'} read
                </span>
                <span className="text-border">•</span>
                <span className="flex items-center gap-2 font-bold text-slate-700">
                  <Eye className="h-4 w-4" />
                  {viewsCount || blog.views || 0} views
                </span>
              </div>
            </div>

            {/* Right Column: Hero Cover Art Card */}
            <div className="lg:col-span-5">
              <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-200/50 dark:border-slate-800/55 hover:scale-[1.01] transition-transform duration-300">
                <img 
                  src={blog.image || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80'} 
                  alt={blog.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Core Layout: Sidebar + Block Contents */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Dynamic Blocks Container Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-headline prose-headings:font-bold prose-headings:text-foreground prose-a:text-primary space-y-4">
            {blog.blocks && Array.isArray(blog.blocks) ? (
              blog.blocks.map((b: any, idx: number) => renderBlock(b, idx))
            ) : (
              // Fallback to legacy raw HTML parsing
              <div dangerouslySetInnerHTML={{ __html: blog.content || `<p>${blog.excerpt}</p>` }} />
            )}
          </div>

          {/* Sibling navigation controls */}
          <div className="grid grid-cols-2 gap-4 border-y border-border py-6 mt-8">
            {prevPost ? (
              <Link href={`/blog/${prevPost.slug || prevPost.id}`} className="group text-left space-y-1 block max-w-xs">
                <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1 group-hover:text-primary transition-colors">
                  <ArrowLeft className="h-3 w-3" /> Previous
                </span>
                <p className="text-sm font-bold text-foreground line-clamp-1 group-hover:underline">{prevPost.title}</p>
              </Link>
            ) : (
              <div />
            )}

            {nextPost ? (
              <Link href={`/blog/${nextPost.slug || nextPost.id}`} className="group text-right space-y-1 block max-w-xs ml-auto">
                <span className="text-xs font-bold text-muted-foreground uppercase flex items-center justify-end gap-1 group-hover:text-primary transition-colors">
                  Next <ArrowRight className="h-3 w-3" />
                </span>
                <p className="text-sm font-bold text-foreground line-clamp-1 group-hover:underline">{nextPost.title}</p>
              </Link>
            ) : (
              <div />
            )}
          </div>

          {/* Feedback Review Form */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-headline font-bold text-foreground">User Reviews ({reviews.length})</h3>
            </div>

            <Card className="border-border bg-card p-6 rounded-2xl shadow-sm">
              <form onSubmit={submitReview} className="space-y-4">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Leave a Review</h4>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Your Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setRating(val)}
                        onMouseEnter={() => setHoverRating(val)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="text-yellow-400 hover:scale-110 transition-transform"
                      >
                        <Star className="h-6 w-6" fill={val <= (hoverRating || rating) ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Your Name</label>
                    <input
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:ring-1 focus:ring-primary outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Feedback Comment</label>
                    <textarea
                      value={reviewerComment}
                      onChange={(e) => setReviewerComment(e.target.value)}
                      placeholder="Share your feedback..."
                      className="w-full h-24 p-3 rounded-lg border border-input bg-background text-sm focus:ring-1 focus:ring-primary outline-none resize-none"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-lg h-10 px-5 transition-colors">
                  Submit Review <Send className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </form>
            </Card>

            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-4 bg-card border border-border rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-foreground">{rev.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {rev.date ? new Date(rev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now'}
                      </p>
                    </div>
                    <div className="flex text-yellow-400 gap-0.5">
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <Star key={starIdx} className="h-3.5 w-3.5" fill={starIdx < rev.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{rev.comment}</p>
                </div>
              ))}

              {reviews.length === 0 && (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  No reviews yet. Share your experience!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Sidebar Widgets Container (Draggable / Enabled Order) */}
        <div className="lg:col-span-4 lg:sticky lg:top-36 space-y-6 self-start">
          {sidebarConfig.map((wConfig: any) => renderSidebarWidget(wConfig))}
        </div>

      </main>
    </div>
  );
}
