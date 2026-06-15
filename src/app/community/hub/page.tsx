'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/hooks/use-user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, Plus, Trash2, Heart, Sparkles, Send, ArrowLeft, ExternalLink, Tag, Globe, MessageCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CommunityHubPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  // Thread creation form state
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");
  const [formSaving, setFormSaving] = useState(false);

  // Filters state
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'mine'>('all');

  // Load posts
  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/community");
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts || []);
      }
    } catch (e) {
      console.error("Failed to load community posts:", e);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    if (!userLoading && !user) {
      router.push(`/login?redirect=${encodeURIComponent("/community/hub")}`);
    } else if (user) {
      fetchPosts();
    }
  }, [user, userLoading, router]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setFormSaving(true);
    try {
      const parsedTags = newTags
        .split(",")
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0);

      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          tags: parsedTags
        })
      });

      const data = await res.json();
      if (data.success) {
        setNewTitle("");
        setNewContent("");
        setNewTags("");
        fetchPosts();
      } else {
        alert(data.error || "Failed to publish post");
      }
    } catch (err) {
      console.error(err);
      alert("Error posting to community");
    } finally {
      setFormSaving(false);
    }
  };

  const handleLikePost = async (id: string) => {
    // Optimistic update locally
    setPosts(prev =>
      prev.map(p => (p.id === id ? { ...p, likes: p.likes + 1 } : p))
    );

    try {
      await fetch("/api/community", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "like" })
      });
    } catch (e) {
      console.error("Failed to register like:", e);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this discussion thread?")) return;

    try {
      const res = await fetch("/api/community", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setPosts(prev => prev.filter(p => p.id !== id));
      } else {
        alert(data.error || "Failed to delete thread");
      }
    } catch (e) {
      console.error("Failed to delete post:", e);
    }
  };

  // Get all unique tags for the sidebar filter
  const allUniqueTags = Array.from(
    new Set(posts.flatMap(p => p.tags || []))
  ).slice(0, 10);

  // Filter posts based on search query, selected tag, and tab
  const filteredPosts = posts.filter(p => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.content.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesTag = selectedTag ? p.tags?.includes(selectedTag) : true;
    const matchesTab = activeFilterTab === 'mine' ? p.authorEmail === user?.email : true;
    return matchesSearch && matchesTag && matchesTab;
  });

  if (userLoading || !user) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-[#FAFCFF] dark:bg-[#030712]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-3">Connecting to Creator Network...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FAFCFF] dark:bg-[#030712] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Background Lights */}
      <div className="absolute inset-x-0 top-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[400px] h-[300px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute top-20 right-1/4 w-[400px] h-[300px] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8 relative z-10 space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-slate-200 dark:border-white/5 pb-6">
          <div className="space-y-1">
            <Link href="/community" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors mb-2">
              <ArrowLeft className="h-3 w-3" /> Back to Channels
            </Link>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider">
                Live Creator Spaces
              </Badge>
            </div>
            <h1 className="text-4xl font-headline font-black text-slate-950 dark:text-white mt-1">
              Community Hub
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Share queries, showcase projects, and connect with peer developers in real-time.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
            <div className="text-center px-4 border-r border-slate-100 dark:border-white/5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">ONLINE NOW</span>
              <span className="text-base font-black text-primary flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                184
              </span>
            </div>
            <div className="text-center px-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">THREADS</span>
              <span className="text-base font-black text-slate-800 dark:text-slate-200">{posts.length}</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-950/30 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full h-10 px-4 rounded-xl border outline-none text-xs font-medium border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-900/60 dark:text-white focus:border-primary/50"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <Button
              onClick={() => { setActiveFilterTab('all'); setSelectedTag(null); }}
              variant={activeFilterTab === 'all' && !selectedTag ? 'default' : 'ghost'}
              className="rounded-xl h-9 text-xs font-bold px-4 transition-all"
            >
              All Threads
            </Button>
            <Button
              onClick={() => { setActiveFilterTab('mine'); setSelectedTag(null); }}
              variant={activeFilterTab === 'mine' && !selectedTag ? 'default' : 'ghost'}
              className="rounded-xl h-9 text-xs font-bold px-4 transition-all"
            >
              My Posts
            </Button>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Feed Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Thread Creation Card */}
            <Card className="p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950/30 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-primary">
                <Sparkles className="h-20 w-20" />
              </div>
              
              <h3 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2 mb-4">
                <MessageSquare className="h-4 w-4 text-primary" /> Start a Discussion
              </h3>

              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="space-y-1.5">
                  <input
                    required
                    type="text"
                    placeholder="Discussion Title (e.g. Next.js 15 deployment issues)"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border outline-none text-xs font-medium border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-900/40 dark:text-white focus:border-primary/50 focus:bg-white dark:focus:bg-slate-900/60"
                  />
                </div>

                <div className="space-y-1.5">
                  <textarea
                    required
                    rows={4}
                    placeholder="What's on your mind? Share details, code snippets, or error logs..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full p-4 rounded-xl border outline-none text-xs font-medium border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-900/40 dark:text-white focus:border-primary/50 focus:bg-white dark:focus:bg-slate-900/60 resize-y"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div className="sm:col-span-2 relative">
                    <input
                      type="text"
                      placeholder="Tags (comma-separated: css, nextjs)"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      className="w-full h-10 px-4 pl-9 rounded-xl border outline-none text-xs font-medium border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-900/40 dark:text-white focus:border-primary/50 focus:bg-white dark:focus:bg-slate-900/60"
                    />
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={formSaving || !newTitle.trim() || !newContent.trim()}
                    className="w-full h-10 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs shadow-md shadow-primary/15 transition-all flex items-center justify-center gap-1.5"
                  >
                    {formSaving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <><Send className="h-3 w-3" /> Post Thread</>
                    )}
                  </Button>
                </div>
              </form>
            </Card>

            {/* Threads Feed Container */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500 mb-2">Discussion Threads</h3>
              
              {postsLoading ? (
                <div className="p-16 text-center border border-dashed rounded-3xl border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950/20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  <p className="text-xs text-slate-500 mt-2 font-medium">Fetching community threads...</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="p-16 text-center border border-dashed rounded-3xl border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950/20 space-y-2">
                  <MessageCircle className="h-8 w-8 text-primary/40 mx-auto" />
                  <p className="text-xs text-slate-500 font-bold">No discussions found matching filters</p>
                  <p className="text-[10px] text-slate-400">Be the first to start a discussion thread above!</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredPosts.map((post) => {
                    const isOwner = post.authorEmail === user.email;
                    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
                    
                    return (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="p-6 rounded-3xl border bg-white dark:bg-slate-950/40 border-slate-100 dark:border-white/5 shadow-sm space-y-4 hover:border-primary/10 transition-colors relative"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1 pr-8">
                            <h4 className="font-bold text-base text-slate-950 dark:text-white leading-snug">
                              {post.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400 font-medium">
                              <span>By <strong className="text-slate-600 dark:text-slate-350">{post.author}</strong></span>
                              <span>•</span>
                              <span>{new Date(post.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>

                          {(isOwner || isAdmin) && (
                            <Button
                              onClick={() => handleDeletePost(post.id)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium whitespace-pre-wrap">
                          {post.content}
                        </p>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {post.tags?.map((tag: string) => (
                            <Badge
                              key={tag}
                              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                              className={cn(
                                "text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full cursor-pointer transition-all",
                                selectedTag === tag
                                  ? "bg-primary text-white border-none"
                                  : "bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10"
                              )}
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center gap-4 pt-2 border-t border-slate-50 dark:border-white/5">
                          <Button
                            onClick={() => handleLikePost(post.id)}
                            variant="ghost"
                            size="sm"
                            className="h-8 text-slate-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl text-xs gap-1.5"
                          >
                            <Heart className="h-3.5 w-3.5 fill-current text-rose-500" />
                            <span>{post.likes}</span>
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

          </div>

          {/* Sidebar Filters Column */}
          <div className="space-y-6">
            
            {/* Community Rules card */}
            <div className="p-6 rounded-3xl border bg-white dark:bg-slate-950/40 border-slate-100 dark:border-white/5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500 flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-primary" /> Guidelines
              </h3>
              <ul className="space-y-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium list-disc list-inside">
                <li>Be respectful and support other developers.</li>
                <li>Share code snippets and exact error logs.</li>
                <li>Avoid spamming links or promotional content.</li>
                <li>For support account queries, use the support portal directly.</li>
              </ul>
            </div>

            {/* Popular Tags Card */}
            {allUniqueTags.length > 0 && (
              <div className="p-6 rounded-3xl border bg-white dark:bg-slate-950/40 border-slate-100 dark:border-white/5 shadow-sm space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">Popular Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {allUniqueTags.map(tag => (
                    <Badge
                      key={tag}
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      className={cn(
                        "text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full cursor-pointer transition-all",
                        selectedTag === tag
                          ? "bg-primary text-white border-none"
                          : "bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10"
                      )}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Links Card */}
            <div className="p-6 rounded-3xl border bg-white dark:bg-slate-950/40 border-slate-100 dark:border-white/5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">Quick Links</h3>
              <div className="space-y-2 text-xs font-semibold">
                <Link href="/community" className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 transition-colors">
                  <span>Creator Channels</span>
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </Link>
                <Link href="/profile" className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 transition-colors">
                  <span>Student Workspace</span>
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </Link>
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}

// Simple fallback card
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
function Card({ className, ...props }: CardProps) {
  return <div className={cn("bg-card text-card-foreground", className)} {...props} />;
}
