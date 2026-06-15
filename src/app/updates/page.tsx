'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Bell, Rocket, Zap, Award, MessageSquare, User, Calendar, FileText, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

type UpdateItem = {
  id: string;
  title: string;
  excerpt: string;
  tags: string[];
  date: string;
  author?: string;
  document_link?: string;
  read_more_link?: string;
  is_urgent?: boolean;
  extra_info?: string;
};

export default function PlatformUpdatesPage() {
  const [items, setItems] = useState<UpdateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState('All');
  
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  // Helper to convert base64 VAPID public key
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  const handleSubscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Push notifications are not supported in this browser.');
      return;
    }
    setSubscribing(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Permission not granted for notifications.');
        setSubscribing(false);
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error('VAPID public key is missing from environment variables.');
      }

      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      const res = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription })
      });

      if (!res.ok) throw new Error('Failed to store subscription on server');
      
      setIsSubscribed(true);
      alert('You are successfully subscribed to push notifications!');
    } catch (e: any) {
      console.error('Push notification subscription error:', e);
      alert('Failed to subscribe: ' + (e.message || String(e)));
    } finally {
      setSubscribing(false);
    }
  };

  const fetchUpdates = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/updates');
      if (!res.ok) throw new Error(`Failed to load updates: ${res.status}`);
      const json = await res.json();
      const data = Array.isArray(json?.data) ? json.data : [];
      const normalized = data.map((u: any) => ({
        id: u.slug || u.id,
        title: u.title,
        excerpt: u.excerpt || '',
        tags: Array.isArray(u.tags) ? u.tags : [],
        date: u.created_at || u.updated_at || new Date().toISOString(),
        author: typeof u.author === 'string' ? u.author : '',
        document_link: u.document_link || '',
        read_more_link: u.read_more_link || '',
        is_urgent: !!u.is_urgent,
        extra_info: u.extra_info || '',
      }));
      setItems(normalized);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
    // Check current subscription status
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setIsSubscribed(!!subscription);
        });
      });
    }
  }, []);

  const filterTags = useMemo(() => {
    const tags = new Set<string>();
    items.forEach((item) => {
      item.tags.forEach((tag) => {
        if (tag) tags.add(tag);
      });
    });
    return ['All', ...Array.from(tags).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((u) => {
      if (activeTag !== 'All' && !u.tags.includes(activeTag)) return false;
      if (query && !(`${u.title} ${u.excerpt}`.toLowerCase().includes(query.toLowerCase()))) return false;
      return true;
    });
  }, [items, query, activeTag]);

  const counts = useMemo(() => {
    const total = items.length;
    const platform = items.filter((u) => u.tags.includes('Platform')).length;
    const courses = items.filter((u) => u.tags.includes('Course')).length;
    const general = items.filter((u) => u.tags.length === 0).length;
    return { total, platform, courses, general };
  }, [items]);

  // Map tag to icon helper
  const getIconForTag = (tags: string[]) => {
    if (tags.includes('Platform')) return Rocket;
    if (tags.includes('Course')) return Award;
    if (tags.includes('Event')) return MessageSquare;
    return Zap;
  };

  return (
    <div className="w-full bg-background min-h-screen">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
        {/* Hero / Search */}
        <section className="mb-8">
          <div className="rounded-[2.5rem] bg-gradient-to-r from-red-50 to-slate-50 dark:from-slate-900 dark:to-red-950/20 p-8 md:p-12 border border-slate-200/50 dark:border-slate-800/40 shadow-sm space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1 space-y-2">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-500 font-bold text-xs shadow-sm border border-red-500/20"
                >
                  <Bell className="h-3.5 w-3.5 animate-pulse" /> SYSTEM LOGS: ACTIVE
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-headline font-black text-slate-900 dark:text-white leading-tight">
                  Notices & Updates
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed max-w-xl">
                  Stay informed with the latest updates, announcements, and important information from the XmartyCreator ecosystem.
                </p>
              </div>

              <div className="w-full lg:w-1/3">
                <div className="relative">
                  <Input
                    className="pl-10 h-12 rounded-xl bg-white dark:bg-slate-950 focus-visible:ring-red-500 border-slate-200 dark:border-slate-800"
                    placeholder="Search articles, announcements, updates..."
                    value={query}
                    onChange={(e: any) => setQuery(e.target.value)}
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4.5 w-4.5" />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {filterTags.map((t) => (
                <Button
                  key={t}
                  size="sm"
                  variant={t === activeTag ? 'default' : 'outline'}
                  onClick={() => setActiveTag(t)}
                  className={`rounded-xl px-4 py-2 font-semibold transition-all ${
                    t === activeTag 
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-md' 
                      : 'hover:bg-red-500/10 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-10">
          <div className="p-5 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-lg border border-indigo-400/20">
            <div className="text-xs uppercase tracking-wider font-bold opacity-80">Total Updates</div>
            <div className="text-3xl font-headline font-black mt-2">{counts.total}</div>
          </div>
          <div className="p-5 rounded-[2rem] bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg border border-pink-400/20">
            <div className="text-xs uppercase tracking-wider font-bold opacity-80">Platform</div>
            <div className="text-3xl font-headline font-black mt-2">{counts.platform}</div>
          </div>
          <div className="p-5 rounded-[2rem] bg-gradient-to-br from-cyan-500 to-teal-500 text-white shadow-lg border border-cyan-400/20">
            <div className="text-xs uppercase tracking-wider font-bold opacity-80">Courses</div>
            <div className="text-3xl font-headline font-black mt-2">{counts.courses}</div>
          </div>
          <div className="p-5 rounded-[2rem] bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-md border border-slate-200/50 dark:border-slate-800/40">
            <div className="text-xs uppercase tracking-wider font-bold opacity-60">General</div>
            <div className="text-3xl font-headline font-black mt-2 text-slate-900 dark:text-white">{counts.general}</div>
          </div>
        </section>

        {/* Updates Feed */}
        <section className="mb-12">
          <h3 className="text-xl font-headline font-bold mb-6 text-slate-950 dark:text-white">
            All Updates ({filtered.length})
          </h3>
          
          {loading ? (
            <div className="text-center py-12 text-slate-500 animate-pulse">Loading platform updates...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500 border border-red-500/10 rounded-[2rem] bg-red-500/5">
              Error loading updates: {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem]">
              No updates match your search criteria.
            </div>
          ) : (
            <div className="grid gap-6">
              {filtered.map((u, idx) => {
                const Icon = getIconForTag(u.tags);
                return (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                    viewport={{ once: true }}
                  >
                    <div 
                      onClick={() => {
                        const targetUrl = u.read_more_link || u.document_link;
                        if (targetUrl) {
                          window.open(targetUrl, '_blank', 'noopener,noreferrer');
                        }
                      }}
                      className={`block text-left border rounded-3xl p-6 md:p-8 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100/60 dark:hover:bg-slate-900/60 transition-all duration-300 shadow-sm border-slate-200/60 dark:border-slate-800/80 max-w-2xl relative group ${
                        u.is_urgent ? 'ring-2 ring-red-500 border-red-500 dark:ring-red-600 dark:border-red-600' : ''
                      } ${u.read_more_link || u.document_link ? 'cursor-pointer' : ''}`}
                    >
                      {u.is_urgent && (
                        <span className="absolute top-4 right-6 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-red-600 text-white animate-pulse shadow-sm shadow-red-500/50">
                          Urgent ⚠️
                        </span>
                      )}

                      <div className="space-y-4">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider">
                            <FileText className="h-3.5 w-3.5" />
                            {String(u.tags[0] || 'general').toLowerCase()}
                          </span>
                        </div>

                        <h4 className="text-xl font-headline font-black text-slate-900 dark:text-white group-hover:text-red-500 transition-colors leading-tight">
                          {u.title}
                        </h4>

                        {u.extra_info && (
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {u.extra_info}
                          </p>
                        )}

                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                          {u.excerpt}
                        </p>

                        {u.document_link && (
                          <div className="pt-1">
                            <span 
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(u.document_link, '_blank', 'noopener,noreferrer');
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-200/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-red-500/10 hover:text-red-600 transition-colors cursor-pointer border border-slate-300/40 dark:border-slate-700/40"
                            >
                              <FileText className="h-3.5 w-3.5" /> Document
                            </span>
                          </div>
                        )}

                        <div className="border-t border-slate-200 dark:border-slate-800/80 my-4 pt-4" />

                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{new Date(u.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            {u.author && (
                              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
                                <User className="h-3.5 w-3.5" />
                                <span>{u.author}</span>
                              </div>
                            )}
                          </div>

                          {(u.read_more_link || u.document_link) && (
                            <span className="flex items-center gap-1 text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-red-500 transition-colors">
                              Read <ArrowRight className="h-4 w-4" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* CTA Banner */}
        <section className="rounded-[3rem] overflow-hidden shadow-xl border border-red-500/20">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-12 text-white text-center space-y-6">
            <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto animate-bounce">
              <Bell className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-2 max-w-xl mx-auto">
              <h3 className="text-3xl font-headline font-black">Never Miss an Update</h3>
              <p className="text-white/80 text-sm md:text-base leading-relaxed">
                Stay synchronized with the latest release drops, exam schedules, and curriculum details. Join our alert list!
              </p>
            </div>
            <div className="pt-2">
              <Button 
                size="lg" 
                onClick={handleSubscribe}
                disabled={subscribing || isSubscribed}
                className="bg-white hover:bg-slate-50 text-slate-950 font-bold px-8 h-12 rounded-xl shadow-lg disabled:opacity-80"
              >
                {subscribing ? 'Subscribing...' : isSubscribed ? 'Notifications Enabled ✓' : 'Enable Notifications'}
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
