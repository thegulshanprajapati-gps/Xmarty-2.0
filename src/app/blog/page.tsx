'use client';

import { useEffect, useState } from "react";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Clock, ArrowRight, BookOpen, Star, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

function BlogCardSkeleton() {
  return (
    <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 rounded-xl overflow-hidden flex items-stretch h-48 animate-pulse">
      <div className="w-40 sm:w-44 bg-slate-200 dark:bg-slate-800 shrink-0" />
      <div className="p-5 flex flex-col justify-between flex-grow">
        <div className="space-y-2">
          <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded mt-1" />
          <div className="h-3 w-2/3 bg-slate-100 dark:bg-slate-800 rounded" />
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    </div>
  );
}

function FeaturedSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 animate-pulse grid grid-cols-1 lg:grid-cols-12 gap-0">
      <div className="h-64 lg:h-auto lg:col-span-7 bg-slate-200 dark:bg-slate-800 min-h-60" />
      <div className="p-6 sm:p-8 lg:col-span-5 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-6 w-full bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-6 w-4/5 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded mt-2" />
          <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-800 rounded" />
        </div>
        <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/blogs/comments");
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (e) {
      console.error("Failed to load reviews:", e);
    }
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/blogs');
        if (res.ok) {
          const data = await res.json();
          setBlogs(data);
        }
      } catch (e) {
        console.error('Failed to load blogs:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
    fetchReviews();
  }, []);

  // Update Page Title / Tab Name dynamically
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.title = "Xmarty Creator Journal";
    }
  }, []);

  const categories = ["All", ...Array.from(new Set(
    blogs
      .map(b => (b.category || '').trim())
      .filter(cat => cat.length > 0)
  ))];

  const filteredBlogs = blogs.filter(b => {
    const matchesSearch = b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Find the featured blog (prefer designated true, fallback to first in list)
  const featuredBlog = filteredBlogs.find(b => b.featured) || filteredBlogs[0];
  const standardBlogs = filteredBlogs.filter(b => b.id !== featuredBlog?.id);

  return (
    <div className="w-full bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 transition-colors duration-300 relative py-8">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-10 relative z-10">

        {/* Header - Premium Red Theme */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 uppercase tracking-widest">
              <BookOpen className="h-4 w-4" /> Insights & News
            </div>
            <h1 className="text-4xl font-headline font-black tracking-tight text-slate-950 dark:text-white leading-tight">
              Creator <span className="text-red-500 underline decoration-red-500/20 decoration-wavy underline-offset-4">Journal</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Discover articles, guides, and updates from our engineering network.</p>
          </div>
          <div className="w-full md:w-72">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-11 text-sm rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/60 focus-visible:ring-red-500 focus-visible:ring-1 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Category Pills Selector */}
        {!loading && blogs.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat: any) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                    : "bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-red-500/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-10">
            <section className="space-y-4">
              <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <FeaturedSkeleton />
            </section>
            <section className="space-y-4">
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BlogCardSkeleton />
                <BlogCardSkeleton />
                <BlogCardSkeleton />
                <BlogCardSkeleton />
              </div>
            </section>
          </div>
        )}

        {/* Empty State */}
        {!loading && blogs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-2">
              <BookOpen className="h-8 w-8 text-red-500/60" />
            </div>
            <h2 className="text-xl font-headline font-bold text-slate-800 dark:text-white">No Articles Yet</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
              Our team is working on fresh content. Check back soon for articles, guides, and insights.
            </p>
          </div>
        )}

        {/* Content */}
        {!loading && blogs.length > 0 && (
          <>
            {/* Featured Post Hero Banner */}
            {featuredBlog && (
              <section className="space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">Featured Article</h2>
                <Link href={`/blog/${featuredBlog.slug || featuredBlog.id}`} className="block group">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 shadow-md group-hover:border-red-500/30 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-0">
                    {/* Image Section */}
                    <div className="relative h-64 lg:h-auto lg:col-span-7 min-h-60 overflow-hidden">
                      <Image
                        src={featuredBlog.image || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80'}
                        alt={featuredBlog.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-101"
                        priority
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-red-500 text-white border-none font-bold text-xs py-1 px-3 shadow-md rounded">
                          {featuredBlog.category}
                        </Badge>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 sm:p-8 lg:col-span-5 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {featuredBlog.date}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {featuredBlog.readTime}</span>
                        </div>
                        <h3
                          className="text-xl sm:text-2xl font-headline font-black text-slate-950 dark:text-white group-hover:text-red-500 transition-colors leading-tight"
                          style={{
                            fontFamily: featuredBlog.titleFont || undefined,
                            color: featuredBlog.titleColor || undefined,
                          }}
                        >
                          {featuredBlog.title}
                        </h3>
                        <p
                          className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed"
                          style={{
                            fontFamily: featuredBlog.excerptFont || undefined,
                            color: featuredBlog.excerptColor || undefined,
                          }}
                        >
                          {featuredBlog.excerpt}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-sm">
                        <span
                          className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"
                          style={{
                            fontFamily: featuredBlog.authorFont || undefined,
                            color: featuredBlog.authorColor || undefined,
                          }}
                        >
                          By <span className="inline-block" dangerouslySetInnerHTML={{ __html: featuredBlog.author || 'Admin' }} />
                        </span>
                        <span className="text-red-500 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Read Featured Post <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* Standard Related Articles Grid */}
            <section className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">More Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {standardBlogs.map((blog, idx) => (
                  <motion.div
                    key={blog.id || idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                  >
                    <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 rounded-xl overflow-hidden group hover:border-red-500/40 hover:shadow-md transition-all duration-300 flex items-stretch h-48">

                      {/* Thumbnails */}
                      <div className="relative w-40 sm:w-44 overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-900">
                        <Image
                          src={blog.image || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=300&q=80'}
                          alt={blog.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-102"
                          data-ai-hint="blog preview"
                        />
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                          <Badge className="bg-red-500 text-white border-none font-bold text-xs py-0.5 px-2 shadow-sm rounded">
                            {blog.category}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-5 flex flex-col justify-between flex-grow min-w-0">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" /> {blog.date}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" /> {blog.readTime}
                            </span>
                          </div>

                          <Link href={`/blog/${blog.slug || blog.id}`} className="block">
                            <CardTitle
                              className="text-base font-bold text-slate-950 dark:text-white group-hover:text-red-500 transition-colors leading-tight line-clamp-2"
                              style={{
                                fontFamily: blog.titleFont || undefined,
                                color: blog.titleColor || undefined,
                              }}
                            >
                              {blog.title}
                            </CardTitle>
                          </Link>

                          <p
                            className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed"
                            style={{
                              fontFamily: blog.excerptFont || undefined,
                              color: blog.excerptColor || undefined,
                            }}
                          >
                            {blog.excerpt}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-sm mt-2">
                          <span
                            className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1 min-w-0"
                            style={{
                              fontFamily: blog.authorFont || undefined,
                              color: blog.authorColor || undefined,
                            }}
                          >
                            By <span className="inline-block truncate" dangerouslySetInnerHTML={{ __html: blog.author || 'Admin' }} />
                          </span>
                          <Link href={`/blog/${blog.slug || blog.id}`} className="text-red-500 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                            Read Article <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>

                    </Card>
                  </motion.div>
                ))}

                {filteredBlogs.length === 0 && blogs.length > 0 && (
                  <div className="col-span-full text-center py-16 text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950/20 border rounded-2xl">
                    No matching articles found. Try searching for other topics.
                  </div>
                )}
              </div>
            </section>
          </>
        )}

      </main>

      {/* User Reviews Section */}
      <section className="border-t border-slate-200 dark:border-slate-800 pt-16 pb-24 space-y-10 max-w-5xl mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <Badge className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40 px-3 py-1 rounded-full font-bold text-xs tracking-wider uppercase">
              Reviews
            </Badge>
            <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              User Reviews & Blog Comments
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl font-medium">
              Hear what our community has to say about our platform resources and recent articles.
            </p>
          </div>
          
          <ReviewDialog blogs={blogs} onReviewAdded={fetchReviews} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.length === 0 ? (
            <p className="text-sm text-slate-400 font-medium col-span-2 text-center py-6">No reviews submitted yet. Be the first to leave one!</p>
          ) : (
            reviews.map((rev: any) => (
              <div key={rev.id || rev._id} className="p-6 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 shadow-sm flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white">{rev.name}</h4>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {rev.date ? new Date(rev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                    </span>
                  </div>
                  {/* Stars */}
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3.5 w-3.5",
                          i < Number(rev.rating) ? "fill-amber-500 text-amber-500" : "text-slate-200 dark:text-slate-800"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>
                
                {rev.blogTitle && rev.blogId !== "general" && (
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Commented on:</span>
                    <Link
                      href={`/blog/${rev.blogSlug || rev.blogId}`}
                      className="text-red-500 hover:underline font-semibold flex items-center gap-1"
                    >
                      {rev.blogTitle} <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

    </div>
  );
}

// ── Review Dialog Component ──
function ReviewDialog({ blogs, onReviewAdded }: { blogs: any[]; onReviewAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [selectedBlog, setSelectedBlog] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    const matchedBlog = blogs.find(b => b.id === selectedBlog || b._id === selectedBlog);

    const payload = {
      blogId: matchedBlog ? (matchedBlog.id || matchedBlog._id) : "general",
      blogTitle: matchedBlog ? matchedBlog.title : (selectedBlog || null),
      blogSlug: matchedBlog ? (matchedBlog.slug || matchedBlog.id) : null,
      name,
      comment,
      rating,
    };

    try {
      const res = await fetch("/api/blogs/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setName("");
        setComment("");
        setRating(5);
        setSelectedBlog("");
        setOpen(false);
        onReviewAdded();
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-sm h-11 px-6 rounded-xl shadow-sm">
          Write a Review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-950 dark:text-white">Leave your review</DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Share your comments about our platform resources and recent articles.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Rating</label>
            <div className="flex items-center gap-1 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-xl focus:outline-none transition-transform active:scale-95"
                >
                  <Star
                    className={cn(
                      "h-6 w-6 text-amber-500",
                      star <= rating ? "fill-amber-500 text-amber-500" : "text-slate-300 dark:text-slate-700"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Associated Blog</label>
            <select
              value={selectedBlog}
              onChange={(e) => setSelectedBlog(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-red-500 dark:bg-slate-950"
            >
              <option value="" className="text-slate-400 dark:bg-slate-950">-- None / General Platform --</option>
              {blogs.map((b) => (
                <option key={b.id || b._id} value={b.id || b._id} className="dark:bg-slate-950">
                  {b.title ? b.title.replace(/<[^>]*>/g, '') : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Comment / Review</label>
            <textarea
              required
              rows={4}
              placeholder="What did you think of the article or resources?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
            />
          </div>

          <Button type="submit" className="w-full h-11 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-sm transition-all shadow-md">
            Submit Review
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
