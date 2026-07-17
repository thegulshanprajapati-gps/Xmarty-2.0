'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/hooks/use-user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, MessageSquare, Tag, ArrowLeft, Users, Globe, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function CommunityHubPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineCount, setOnlineCount] = useState(0);

  // Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [formSaving, setFormSaving] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all');

  const fetchCommunities = async () => {
    try {
      const res = await fetch("/api/communities");
      const data = await res.json();
      if (data.success) {
        setCommunities(data.communities || []);
        if (data.onlineCount !== undefined) {
          setOnlineCount(data.onlineCount);
        }
      }
    } catch (e) {
      console.error("Failed to load communities:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userLoading && !user) {
      router.push(`/login?redirect=${encodeURIComponent("/community/hub")}`);
    } else if (user) {
      fetchCommunities();
      const interval = setInterval(fetchCommunities, 15000); // refresh list
      return () => clearInterval(interval);
    }
  }, [user, userLoading, router]);

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newDesc.trim()) return;

    setFormSaving(true);
    try {
      const res = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDesc.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        alert("Community creation request submitted! Awaiting admin approval.");
        setNewName("");
        setNewDesc("");
        setShowCreateModal(false);
        fetchCommunities();
      } else {
        alert(data.error || "Failed to create community space");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating community space");
    } finally {
      setFormSaving(false);
    }
  };

  const filteredCommunities = communities.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'mine' ? c.created_by === user?.email : true;
    return matchesSearch && matchesTab;
  });

  if (userLoading || !user) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-[#FAFCFF] dark:bg-[#030712] relative overflow-hidden">
        {/* Soft atmospheric background lights */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none animate-pulse" style={{ animationDelay: '1.5s' }} />
        
        {/* Custom premium loader graphic: double ring orbiting layout */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[3px] border-primary/10 border-t-primary animate-spin" />
          <div className="absolute inset-2 rounded-full border-[3px] border-indigo-500/5 border-b-indigo-500/40 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary/20 to-indigo-500/20 backdrop-blur-md border border-white/20 dark:border-white/5 animate-pulse" />
        </div>
        
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-6 tracking-wide">
          Connecting to Creator Network
        </h3>
        <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1.5 animate-pulse">
          Establishing secure tunnel...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FAFCFF] dark:bg-[#030712] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Ambient Lights */}
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
                Live Channels
              </Badge>
            </div>
            <h1 className="text-4xl font-black text-slate-950 dark:text-white mt-1">
              Community Hub
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Join live channels, chat with peers, or request a new community space.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
            <div className="text-center px-4 border-r border-slate-100 dark:border-white/5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">ONLINE</span>
              <span className="text-base font-black text-primary flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                {onlineCount}
              </span>
            </div>
            <div className="text-center px-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">CHANNELS</span>
              <span className="text-base font-black text-slate-800 dark:text-slate-200">{communities.filter(c => c.status === 'approved').length}</span>
            </div>
          </div>
        </div>

        {/* Toolbar: Search, Filters, and Create Action */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant={activeTab === 'all' ? 'default' : 'outline'}
              onClick={() => setActiveTab('all')}
              className="rounded-xl font-bold text-xs"
            >
              All Spaces
            </Button>
            <Button
              variant={activeTab === 'mine' ? 'default' : 'outline'}
              onClick={() => setActiveTab('mine')}
              className="rounded-xl font-bold text-xs"
            >
              My Requests
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full md:w-auto">
            <input
              type="text"
              placeholder="Search community spaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="rounded-xl h-11 px-5 font-bold text-sm bg-primary hover:bg-primary/90 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Create Space
            </Button>
          </div>
        </div>

        {/* Communities Grid */}
        {loading ? (
          <div className="w-full py-16 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : filteredCommunities.length === 0 ? (
          <div className="w-full py-20 text-center bg-white dark:bg-slate-950/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
            <Users className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No community spaces found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Be the first to request a new community channel to start collaborating with other creators!
            </p>
            <Button 
              onClick={() => setShowCreateModal(true)}
              variant="outline"
              className="rounded-xl mt-4 text-xs font-bold"
            >
              Create New Community Space
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map((c) => {
              const isPending = c.status === 'pending';
              const isRejected = c.status === 'rejected';
              
              return (
                <div 
                  key={c.id}
                  className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/60 dark:bg-slate-950/30 backdrop-blur-md p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-300/80 dark:hover:border-slate-700 transition-all duration-300 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="bg-primary/5 dark:bg-primary/10 text-primary p-2.5 rounded-xl">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      {isPending && (
                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                          Pending Approval
                        </Badge>
                      )}
                      {isRejected && (
                        <Badge variant="destructive" className="text-[10px] font-bold">
                          Rejected
                        </Badge>
                      )}
                      {!isPending && !isRejected && (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                          Active Channel
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                        {c.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-2">
                        {c.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-slate-100 dark:border-white/5 mt-5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      BY: {c.created_by.split('@')[0]}
                    </span>
                    
                    {isPending || isRejected ? (
                      <Button disabled variant="outline" className="rounded-xl h-9 text-xs font-bold px-4">
                        Locked
                      </Button>
                    ) : (
                      <Button asChild className="rounded-xl h-9 text-xs font-bold px-4 bg-primary hover:bg-primary/95 text-primary-foreground shadow-sm">
                        <Link href={`/community/${c.slug}`}>
                          Open Space
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Create Community Space */}
        <AnimatePresence>
          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden"
              >
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Request Community Channel
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Propose a channel space. Channel will go live after admin approval.
                  </p>
                </div>

                <form onSubmit={handleCreateCommunity} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Channel Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Next.js Developers"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Description</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="What is this channel for?"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="w-full p-4 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateModal(false)}
                      className="rounded-xl h-11 flex-1 font-bold text-sm"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={formSaving}
                      className="rounded-xl h-11 flex-1 font-bold text-sm bg-primary hover:bg-primary/95 text-primary-foreground"
                    >
                      {formSaving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Submit Request"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
