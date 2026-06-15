'use client';

import Link from "next/link";
import { useUser } from "@/hooks/use-user";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useContentBlock } from "@/hooks/use-content-block";
import { cn } from "@/lib/utils";
import { 
  User, Lock, Phone, Camera, Save, Loader2, Award, 
  MessageSquare, Calendar, Clock, ClipboardList, LogOut, 
  Copy, Check, BookOpen, Users, Sparkles, Send, Play, 
  Download, ExternalLink, Settings, ShieldAlert, Award as CertificateIcon 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function ProfileContent() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active Tab State
  const [activeTab, setActiveTab] = useState<string>('community');

  // Load active tab from URL query param if present
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['community', 'profile', 'setting', 'test', 'certificate'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Test & Attempt Data States
  const [allottedTests, setAllottedTests] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loadingTests, setLoadingTests] = useState(true);

  // Edit Profile States
  const [name, setName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [editProfileMessage, setEditProfileMessage] = useState({ type: "", text: "" });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Account Settings States
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [visiblePassword, setVisiblePassword] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState({ type: "", text: "" });
  const [updatingSettings, setUpdatingSettings] = useState(false);

  // User ID Copy Feedback State
  const [copiedId, setCopiedId] = useState(false);

  // Notifications states
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error("Error loading notifications:", e);
    }
  };

  const markNotificationRead = async (id: string, link?: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id })
      });
      setNotifications(prev => prev.map(n => (n._id === id || n.id === id) ? { ...n, read: true } : n));
      setNotifDropdownOpen(false);
      if (link) {
        if (link.startsWith('http') || link.startsWith('www')) {
          window.open(link, '_blank');
        } else {
          router.push(link);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true })
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 4000); // 4-second instant poll
      return () => clearInterval(interval);
    }
  }, [user]);

  // Joined Communities state
  const [joinedChannels, setJoinedChannels] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const list = [];
      if (localStorage.getItem("community_joined_whatsapp")) list.push("whatsapp");
      if (localStorage.getItem("community_joined_app")) list.push("app");
      if (localStorage.getItem("community_joined_telegram")) list.push("telegram");
      if (localStorage.getItem("community_joined_youtube")) list.push("youtube");
      setJoinedChannels(list);
    }
  }, []);

  const handleJoinChannel = (channelKey: string, url: string) => {
    localStorage.setItem(`community_joined_${channelKey}`, "true");
    setJoinedChannels(prev => prev.includes(channelKey) ? prev : [...prev, channelKey]);
    window.open(url, "_blank");
  };

  // Community Content Blocks (resolved dynamically from CMS)
  const heroBadge = useContentBlock("community", "hero", "badgeText", "Community HQ", "text");
  const heroTitle = useContentBlock("community", "hero", "title", "Community Hub", "text");
  const heroSubtitle = useContentBlock("community", "hero", "subtitle", "Connect with fellow creators, access premium resources, and grow together.", "text");
  const heroWhatsappLink = useContentBlock("community", "hero", "whatsappLink", "#", "text");
  const heroIntroLink = useContentBlock("community", "hero", "introLink", "#", "text");
  const videoEmbedUrl = useContentBlock("community", "video", "youtubeEmbedUrl", "https://www.youtube.com/embed/dQw4w9WgXcQ", "text");
  
  const channelsWhatsappLink = useContentBlock("community", "channels", "whatsappLink", "#", "text");
  const channelsAppLink = useContentBlock("community", "channels", "appLink", "#", "text");
  const channelsTelegramLink = useContentBlock("community", "channels", "telegramLink", "#", "text");
  const channelsYoutubeLink = useContentBlock("community", "channels", "youtubeLink", "#", "text");

  // Fetch Tests and Attempts
  const fetchTestsData = async () => {
    try {
      const res1 = await fetch('/api/tests/allotted');
      if (res1.ok) {
        const data1 = await res1.json();
        setAllottedTests(data1.tests || []);
      }
      const res2 = await fetch('/api/tests/attempts');
      if (res2.ok) {
        const data2 = await res2.json();
        setAttempts(data2.attempts || []);
      }
    } catch (e) {
      console.error("Error loading tests data:", e);
    } finally {
      setLoadingTests(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTestsData();
      setName(user.full_name || "");
      setProfilePicture(user.profile_picture || "");
      setMobileNumber(user.mobile_number || "");
    }
  }, [user]);

  const handleSignOut = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }); } catch {}
    try { localStorage.removeItem('xmarty_session'); } catch {}
    window.location.href = '/';
  };

  // Profile Update Submission (Full Name & Profile Picture)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setEditProfileMessage({ type: "", text: "" });

    try {
      const res = await fetch('/api/auth/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: name,
          profile_picture: profilePicture,
        })
      });

      if (res.ok) {
        setEditProfileMessage({ type: "success", text: "Profile details updated successfully!" });
      } else {
        const err = await res.json();
        setEditProfileMessage({ type: "error", text: err.error || "Failed to update profile" });
      }
    } catch (err) {
      setEditProfileMessage({ type: "error", text: "An error occurred while updating profile." });
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Account Settings Update Submission (Mobile & Password)
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingSettings(true);
    setSettingsMessage({ type: "", text: "" });

    try {
      const res = await fetch('/api/auth/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile_number: mobileNumber,
          password: password || undefined
        })
      });

      if (res.ok) {
        setSettingsMessage({ type: "success", text: "Settings saved successfully!" });
        setPassword("");
      } else {
        const err = await res.json();
        setSettingsMessage({ type: "error", text: err.error || "Failed to save settings" });
      }
    } catch (err) {
      setSettingsMessage({ type: "error", text: "An error occurred while saving settings." });
    } finally {
      setUpdatingSettings(false);
    }
  };

  // Profile Picture File Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setEditProfileMessage({ type: "error", text: "Image size should be less than 2MB" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Copy User ID Helper
  const copyUserId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  if (userLoading) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 dark:bg-[#04060E] py-16">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase">Syncing Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full flex items-center justify-center p-4 py-16 bg-slate-50 dark:bg-[#04060E] text-slate-900 dark:text-white">
        <div className="text-center space-y-4 max-w-sm w-full bg-white dark:bg-slate-950/80 p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-xl">
          <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto" />
          <p className="text-base font-semibold">You are not signed in.</p>
          <Link href="/login" className="inline-block w-full">
            <button className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-rose-600 text-white font-bold transition-all duration-200 shadow-md">
              Go to Sign In
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-[#04060E] text-slate-900 dark:text-white transition-colors duration-300 relative">
      {/* Dynamic styling for node visual flow inside sidebar/tabs */}
      <style>{`
        @keyframes flow-dash { to { stroke-dashoffset: -20; } }
        @keyframes pulse-glow { 0%, 100% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(1.25); opacity: 0.85; } }
        @keyframes float-nodes { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
        .node-flow-line { stroke-dasharray: 6 4; animation: flow-dash 1.5s linear infinite; }
        .node-outer-glow { transform-origin: center; animation: pulse-glow 3s ease-in-out infinite; }
        .node-container-float { animation: float-nodes 4s ease-in-out infinite; }
      `}</style>

      {/* Subtle Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden dark:block">
        <div className="absolute top-[10%] left-[5%] w-[450px] h-[450px] bg-primary/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[10%] right-[5%] w-[450px] h-[450px] bg-indigo-500/5 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto min-h-screen flex flex-col lg:flex-row relative z-10">
        
        {/* ── LEFT SIDEBAR (Side Panel for Students) ── */}
        <aside className="w-full lg:w-72 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-white/5 p-6 flex flex-col justify-between bg-white/40 dark:bg-slate-950/20 backdrop-blur-md">
          <div className="space-y-6">
            
            {/* Header / Brand */}
            <div className="flex items-center gap-3 pb-5 border-b border-slate-200 dark:border-white/5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-rose-600 flex items-center justify-center shadow-md shadow-primary/10">
                <span className="text-white font-bold text-xs">XC</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline font-bold text-sm leading-tight text-slate-800 dark:text-indigo-400">Student Panel</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">Xmarty Dashboard</span>
              </div>
            </div>

            {/* Profile Brief Info */}
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 shadow-sm">
              <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-primary/20 shrink-0 bg-slate-800 flex items-center justify-center">
                {profilePicture ? (
                  <img src={profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-5 w-5 text-slate-400" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-slate-950 dark:text-white truncate">{user.full_name || "Student"}</h3>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold truncate block">{user.email}</span>
              </div>
            </div>

            {/* Side Navigation Menu */}
            <nav className="space-y-1.5 pt-2">
              <button
                onClick={() => setActiveTab('community')}
                className={cn(
                  "w-full h-11 px-4 rounded-xl font-bold text-xs flex items-center gap-3 transition-all border",
                  activeTab === 'community'
                    ? "bg-primary/15 text-primary border-primary/20 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-white/[0.03] hover:text-slate-950 dark:hover:text-white"
                )}
              >
                <MessageSquare className="h-4.5 w-4.5" />
                <span>Community Hub</span>
                {activeTab === 'community' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={cn(
                  "w-full h-11 px-4 rounded-xl font-bold text-xs flex items-center gap-3 transition-all border",
                  activeTab === 'profile'
                    ? "bg-primary/15 text-primary border-primary/20 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-white/[0.03] hover:text-slate-950 dark:hover:text-white"
                )}
              >
                <User className="h-4.5 w-4.5" />
                <span>Edit Profile</span>
                {activeTab === 'profile' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
              </button>

              <button
                onClick={() => setActiveTab('setting')}
                className={cn(
                  "w-full h-11 px-4 rounded-xl font-bold text-xs flex items-center gap-3 transition-all border",
                  activeTab === 'setting'
                    ? "bg-primary/15 text-primary border-primary/20 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-white/[0.03] hover:text-slate-950 dark:hover:text-white"
                )}
              >
                <Settings className="h-4.5 w-4.5" />
                <span>Settings</span>
                {activeTab === 'setting' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
              </button>

              <button
                onClick={() => setActiveTab('test')}
                className={cn(
                  "w-full h-11 px-4 rounded-xl font-bold text-xs flex items-center gap-3 transition-all border",
                  activeTab === 'test'
                    ? "bg-primary/15 text-primary border-primary/20 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-white/[0.03] hover:text-slate-950 dark:hover:text-white"
                )}
              >
                <ClipboardList className="h-4.5 w-4.5" />
                <span>Assessments</span>
                {activeTab === 'test' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
              </button>

              <button
                onClick={() => setActiveTab('certificate')}
                className={cn(
                  "w-full h-11 px-4 rounded-xl font-bold text-xs flex items-center gap-3 transition-all border",
                  activeTab === 'certificate'
                    ? "bg-primary/15 text-primary border-primary/20 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-white/[0.03] hover:text-slate-950 dark:hover:text-white"
                )}
              >
                <Award className="h-4.5 w-4.5" />
                <span>Certificates</span>
                {activeTab === 'certificate' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
              </button>
            </nav>
          </div>

          {/* Footer Controls (User ID Badge & Sign Out) */}
          <div className="pt-6 border-t border-slate-200 dark:border-white/5 space-y-4">
            
            {/* User ID block */}
            <div 
              onClick={copyUserId}
              className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 cursor-pointer hover:border-primary/25 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all group flex items-center justify-between"
            >
              <div className="min-w-0">
                <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">My User ID</span>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold block truncate">{user.id}</span>
              </div>
              <button className="shrink-0 p-1 text-slate-400 hover:text-primary transition-colors">
                {copiedId ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 group-hover:scale-110" />}
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleSignOut}
              className="w-full h-11 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-2 border border-rose-500/20"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* ── MAIN WORKSPACE CONTENT AREA ── */}
        <main className="flex-1 p-6 md:p-10 lg:pl-12 overflow-y-auto">
          
          {/* Header Bar with Welcome message & Notifications dropdown */}
          <div className="flex justify-between items-center pb-5 border-b border-slate-200 dark:border-white/5 mb-8 relative">
            <div>
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">Student Dashboard</span>
              <h1 className="text-xl md:text-2xl font-headline font-black text-slate-900 dark:text-white truncate">
                Welcome, {user.full_name || "Student"}
              </h1>
            </div>

            {/* Notification Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="h-10 w-10 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 flex items-center justify-center relative hover:scale-105 active:scale-95 transition-all text-slate-600 dark:text-slate-350"
              >
                <i className="fa-solid fa-bell text-sm"></i>
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-bounce">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-80 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 shadow-2xl p-4 z-50 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1">
                        <i className="fa-solid fa-bell text-indigo-500"></i> Notifications
                      </span>
                      {notifications.filter(n => !n.read).length > 0 && (
                        <button 
                          onClick={markAllRead}
                          className="text-[10px] text-primary hover:underline font-bold"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2.5 scrollbar-hide pr-1">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400 font-medium">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notif: any) => (
                          <div 
                            key={notif._id || notif.id}
                            onClick={() => markNotificationRead(notif._id || notif.id, notif.link)}
                            className={cn(
                              "p-3 rounded-xl border text-left cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-white/[0.02] space-y-1 relative",
                              notif.read 
                                ? "bg-white dark:bg-transparent border-slate-100 dark:border-white/5 opacity-70" 
                                : "bg-slate-50 dark:bg-white/[0.01] border-primary/20"
                            )}
                          >
                            {!notif.read && (
                              <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-primary" />
                            )}
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white pr-4">{notif.title}</h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">{notif.message}</p>
                            <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold block pt-1">
                              {new Date(notif.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <AnimatePresence mode="wait">
            
            {/* TAB 1: ACTIVE COMMUNITY HUB */}
            {activeTab === 'community' && (
              <motion.div
                key="community"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-10"
              >
                {/* Hero section */}
                <div className="flex flex-col md:flex-row gap-8 items-center justify-between border-b border-slate-200 dark:border-white/5 pb-6">
                  <div className="space-y-3 max-w-lg">
                    <Badge className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider">
                      Active Creator Spaces
                    </Badge>
                    <h1 className="text-3xl font-headline font-black text-slate-900 dark:text-white">
                      Community Hub
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      Connect with fellow creators, access premium resources, and trace your joined group communities below.
                    </p>
                  </div>

                  {/* SVG Node Graph decoration */}
                  <div className="shrink-0 flex items-center justify-center">
                    <div className="relative w-40 h-28 rounded-2xl bg-primary/5 dark:bg-slate-950/40 flex items-center justify-center border border-primary/10 dark:border-white/5 shadow-inner">
                      <svg width="100" height="100" viewBox="0 0 200 200" className="text-primary/70 dark:text-primary/70 node-container-float">
                        <line x1="100" y1="45" x2="50" y2="140" stroke="currentColor" strokeWidth="2.5" className="node-flow-line" />
                        <line x1="100" y1="45" x2="150" y2="140" stroke="currentColor" strokeWidth="2.5" className="node-flow-line" />
                        <line x1="50" y1="140" x2="150" y2="140" stroke="currentColor" strokeWidth="2.5" className="node-flow-line" />
                        <circle cx="100" cy="45" r="16" fill="none" stroke="currentColor" strokeWidth="2.5" className="node-outer-glow" style={{ animationDelay: '0s' }} />
                        <circle cx="100" cy="45" r="7" fill="currentColor" />
                        <circle cx="50" cy="140" r="16" fill="none" stroke="currentColor" strokeWidth="2.5" className="node-outer-glow" style={{ animationDelay: '1s' }} />
                        <circle cx="50" cy="140" r="7" fill="currentColor" />
                        <circle cx="150" cy="140" r="16" fill="none" stroke="currentColor" strokeWidth="2.5" className="node-outer-glow" style={{ animationDelay: '2s' }} />
                        <circle cx="150" cy="140" r="7" fill="currentColor" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 1. Recently Joined Communities */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Recently Joined Communities</h3>
                  </div>

                  {joinedChannels.length === 0 ? (
                    <div className="p-8 text-center border border-dashed rounded-3xl border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950/20">
                      <p className="text-xs text-slate-450 font-medium">You haven't joined any community groups yet. Explore and join them below!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        {
                          key: "whatsapp",
                          title: "WhatsApp Chat Group",
                          description: "Active community group chat for developer QA, resources sharing, and instant peer support.",
                          url: String(channelsWhatsappLink.value),
                          bg: "from-[#10B981] to-[#047857]",
                          icon: <i className="fa-brands fa-whatsapp text-lg"></i>
                        },
                        {
                          key: "app",
                          title: "Mobile App Hub",
                          description: "Downloaded learning application with resource access, push notifications, and offline tools.",
                          url: String(channelsAppLink.value),
                          bg: "from-[#3B82F6] to-[#1D4ED8]",
                          icon: <Download className="h-5 w-5" />
                        },
                        {
                          key: "telegram",
                          title: "Telegram Channel",
                          description: "Centralized feed for schedules, links releases, class alerts, and automated bot support.",
                          url: String(channelsTelegramLink.value),
                          bg: "from-[#06B6D4] to-[#0369A1]",
                          icon: <i className="fa-brands fa-telegram text-lg"></i>
                        },
                        {
                          key: "youtube",
                          title: "YouTube Channel",
                          description: "Weekly streams archive, step-by-step video courses, and exam walkthroughs feed.",
                          url: String(channelsYoutubeLink.value),
                          bg: "from-[#EF4444] to-[#B91C1C]",
                          icon: <i className="fa-brands fa-youtube text-lg"></i>
                        }
                      ].filter(c => joinedChannels.includes(c.key)).map((c) => (
                        <div key={c.key} className="p-5 rounded-2xl border bg-white dark:bg-slate-950/60 border-emerald-500/20 flex items-start gap-4 shadow-sm relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-3 bg-emerald-500/10 text-emerald-500 rounded-bl-xl text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <Check className="h-3 w-3" /> Joined
                          </div>
                          <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center text-white shrink-0 bg-gradient-to-br", c.bg)}>
                            {c.icon}
                          </div>
                          <div className="space-y-1 pr-12 min-w-0">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{c.title}</h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{c.description}</p>
                            <Button 
                              onClick={() => handleJoinChannel(c.key, c.url)}
                              variant="link" 
                              className="h-auto p-0 text-xs font-bold text-primary hover:text-primary/80 mt-2 gap-1"
                            >
                              Visit Channel <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Explore Other Communities to Join */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Explore Other Communities to Join</h3>
                  
                  {[
                    {
                      key: "whatsapp",
                      title: "WhatsApp Chat Group",
                      description: "Join our main chat group for community peer networking, live Q&A support, and updates.",
                      url: String(channelsWhatsappLink.value),
                      bg: "from-[#10B981] to-[#047857]",
                      btnText: "Join WhatsApp Chat",
                      icon: <i className="fa-brands fa-whatsapp text-lg"></i>
                    },
                    {
                      key: "app",
                      title: "Mobile App Hub",
                      description: "Install the Android application for notifications, direct classes logs, and resources offline.",
                      url: String(channelsAppLink.value),
                      bg: "from-[#3B82F6] to-[#1D4ED8]",
                      btnText: "Download Application",
                      icon: <Download className="h-5 w-5" />
                    },
                    {
                      key: "telegram",
                      title: "Telegram Channel",
                      description: "Get updates on class timetables, links, syllabus files, and bot announcements feed.",
                      url: String(channelsTelegramLink.value),
                      bg: "from-[#06B6D4] to-[#0369A1]",
                      btnText: "Join Telegram Bot",
                      icon: <i className="fa-brands fa-telegram text-lg"></i>
                    },
                    {
                      key: "youtube",
                      title: "YouTube Channel",
                      description: "Subscribe for tutorial streams, course walk-through answer sheets, and live mentorship calls.",
                      url: String(channelsYoutubeLink.value),
                      bg: "from-[#EF4444] to-[#B91C1C]",
                      btnText: "Subscribe Channel",
                      icon: <i className="fa-brands fa-youtube text-lg"></i>
                    }
                  ].filter(c => !joinedChannels.includes(c.key)).length === 0 ? (
                    <div className="p-8 text-center border border-dashed rounded-3xl border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950/20">
                      <p className="text-xs text-emerald-500 font-bold flex items-center justify-center gap-1.5">
                        <Check className="h-4 w-4" /> You have successfully connected all available creator channels!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        {
                          key: "whatsapp",
                          title: "WhatsApp Chat Group",
                          description: "Join our main chat group for community peer networking, live Q&A support, and updates.",
                          url: String(channelsWhatsappLink.value),
                          bg: "from-[#10B981] to-[#047857]",
                          btnText: "Join WhatsApp Chat",
                          icon: <i className="fa-brands fa-whatsapp text-lg"></i>
                        },
                        {
                          key: "app",
                          title: "Mobile App Hub",
                          description: "Install the Android application for notifications, direct classes logs, and resources offline.",
                          url: String(channelsAppLink.value),
                          bg: "from-[#3B82F6] to-[#1D4ED8]",
                          btnText: "Download Application",
                          icon: <Download className="h-5 w-5" />
                        },
                        {
                          key: "telegram",
                          title: "Telegram Channel",
                          description: "Centralized bot feed for timetables releases, files updates, and support chats.",
                          url: String(channelsTelegramLink.value),
                          bg: "from-[#06B6D4] to-[#0369A1]",
                          btnText: "Join Telegram Channel",
                          icon: <i className="fa-brands fa-telegram text-lg"></i>
                        },
                        {
                          key: "youtube",
                          title: "YouTube Channel",
                          description: "Subscribe for tutorial streams, course walk-through answer sheets, and live mentorship calls.",
                          url: String(channelsYoutubeLink.value),
                          bg: "from-[#EF4444] to-[#B91C1C]",
                          btnText: "Subscribe Channel",
                          icon: <i className="fa-brands fa-youtube text-lg"></i>
                        }
                      ].filter(c => !joinedChannels.includes(c.key)).map((c) => (
                        <div key={c.key} className="p-5 rounded-2xl border bg-white dark:bg-slate-950/40 border-slate-200 dark:border-white/5 flex flex-col justify-between gap-4 shadow-sm hover:border-primary/25">
                          <div className="flex items-start gap-4">
                            <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center text-white shrink-0 bg-gradient-to-br", c.bg)}>
                              {c.icon}
                            </div>
                            <div className="space-y-1 min-w-0">
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{c.title}</h4>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{c.description}</p>
                            </div>
                          </div>
                          <Button 
                            onClick={() => handleJoinChannel(c.key, c.url)}
                            className={cn("w-full h-9 text-xs font-bold text-white rounded-xl bg-gradient-to-r shadow-sm", c.bg)}
                          >
                            {c.btnText}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 2: EDIT PROFILE */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="max-w-xl space-y-6"
              >
                <div className="border-b border-slate-200 dark:border-white/5 pb-4 mb-4">
                  <h1 className="text-2xl font-headline font-bold">Edit Profile Details</h1>
                  <p className="text-xs text-slate-400">Update your student name and upload a customized avatar image.</p>
                </div>

                {editProfileMessage.text && (
                  <div className={`rounded-xl p-3 text-xs font-semibold border ${
                    editProfileMessage.type === 'success' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                  }`}>
                    {editProfileMessage.text}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div className="flex flex-col items-center sm:flex-row gap-5 p-5 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full overflow-hidden bg-slate-800 border-2 border-primary/20 flex items-center justify-center relative shadow-inner">
                        {profilePicture ? (
                          <img src={profilePicture} alt="Profile Preview" className="w-full h-full object-cover" />
                        ) : (
                          <User className="h-8 w-8 text-slate-500" />
                        )}
                      </div>
                      <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 h-8 w-8 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer shadow hover:scale-105 active:scale-95 transition-all">
                        <Camera className="h-4 w-4" />
                      </label>
                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                    <div className="text-center sm:text-left space-y-1">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Avatar Image</span>
                      <p className="text-[10px] text-slate-400">Upload JPEG, PNG (max size 2MB), or paste a direct URL below.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Your Full Name</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <User className="h-4 w-4" />
                        </div>
                        <input
                          required
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Rahul Kumar"
                          className="w-full h-11 pl-11 pr-4 rounded-xl border outline-none text-sm border-slate-200 bg-white text-slate-950 focus:border-primary/60 dark:border-white/5 dark:bg-slate-900 dark:text-white dark:focus:border-primary/60"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Profile Picture URL (Alternative)</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <Camera className="h-4 w-4" />
                        </div>
                        <input
                          type="text"
                          value={profilePicture.startsWith("data:") ? "" : profilePicture}
                          onChange={(e) => setProfilePicture(e.target.value)}
                          placeholder="Paste a direct image url link..."
                          className="w-full h-11 pl-11 pr-4 rounded-xl border outline-none text-sm border-slate-200 bg-white text-slate-950 focus:border-primary/60 dark:border-white/5 dark:bg-slate-900 dark:text-white dark:focus:border-primary/60"
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={updatingProfile} className="w-full h-11 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow">
                    {updatingProfile ? (
                      <>
                        <Loader2 className="h-4.5 w-4.5 animate-spin" /> Updating Profile...
                      </>
                    ) : (
                      <>
                        <Save className="h-4.5 w-4.5" /> Save Profile Info
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* TAB 3: ACCOUNT SETTINGS */}
            {activeTab === 'setting' && (
              <motion.div
                key="setting"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="max-w-xl space-y-6"
              >
                <div className="border-b border-slate-200 dark:border-white/5 pb-4 mb-4">
                  <h1 className="text-2xl font-headline font-bold">Settings & Security</h1>
                  <p className="text-xs text-slate-400">Configure your mobile number credentials or change your account login password.</p>
                </div>

                {settingsMessage.text && (
                  <div className={`rounded-xl p-3 text-xs font-semibold border ${
                    settingsMessage.type === 'success' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                  }`}>
                    {settingsMessage.text}
                  </div>
                )}

                <form onSubmit={handleUpdateSettings} className="space-y-5">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Student Phone Number</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <Phone className="h-4 w-4" />
                        </div>
                        <input
                          type="tel"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          placeholder="e.g. +91 9876543210"
                          className="w-full h-11 pl-11 pr-4 rounded-xl border outline-none text-sm border-slate-200 bg-white text-slate-950 focus:border-primary/60 dark:border-white/5 dark:bg-slate-900 dark:text-white dark:focus:border-primary/60"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Change Password (Leave blank to keep current)</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <Lock className="h-4 w-4" />
                        </div>
                        <input
                          type={visiblePassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter new account password"
                          className="w-full h-11 pl-11 pr-11 rounded-xl border outline-none text-sm border-slate-200 bg-white text-slate-950 focus:border-primary/60 dark:border-white/5 dark:bg-slate-900 dark:text-white dark:focus:border-primary/60"
                        />
                        <button
                          type="button"
                          onClick={() => setVisiblePassword(!visiblePassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-650 transition"
                        >
                          <i className={`fa-solid ${visiblePassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={updatingSettings} className="w-full h-11 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow">
                    {updatingSettings ? (
                      <>
                        <Loader2 className="h-4.5 w-4.5 animate-spin" /> Saving settings...
                      </>
                    ) : (
                      <>
                        <Save className="h-4.5 w-4.5" /> Save Settings
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* TAB 4: ASSESSMENTS / TESTS */}
            {activeTab === 'test' && (
              <motion.div
                key="test"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-200 dark:border-white/5 pb-4 mb-4">
                  <h1 className="text-2xl font-headline font-bold">Allotted Assessments</h1>
                  <p className="text-xs text-slate-400">Assigned tests, practice exams, and class validation checklists allotted for your ID.</p>
                </div>

                {loadingTests ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p className="text-xs font-bold uppercase tracking-wider">Loading assignments...</p>
                  </div>
                ) : allottedTests.length === 0 ? (
                  <div className="text-center py-16 border border-dashed rounded-3xl border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950/20">
                    <ClipboardList className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">No allotted tests found</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Contact support or your class instructor if tests haven't been allotted to your ID.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {allottedTests.map((test) => {
                      const testAttempt = attempts.find(a => a.test_id === test.id);
                      return (
                        <div key={test.id} className="p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-primary/20">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-slate-900 dark:text-white text-sm">{test.title}</h4>
                              
                              {testAttempt ? (
                                testAttempt.passed ? (
                                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Passed</span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">Failed</span>
                                )
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Awaiting Attempt</span>
                              )}

                              {test.type === 'contest' && (
                                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">🏆 Contest</span>
                              )}

                              {test.leaderboard_enabled && (
                                <Link href={`/leaderboard/${test.id}`} className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20">
                                  📊 Rankings
                                </Link>
                              )}
                            </div>
                            {test.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 font-medium">{test.description}</p>
                            )}
                            <div className="flex gap-4 text-[10px] font-bold text-slate-400">
                              <span>⏱ {test.time_limit} Mins</span>
                              <span>❓ {test.questionCount} Questions</span>
                              <span>🎯 Cutoff: {test.pass_marks}%</span>
                            </div>
                          </div>

                          <div className="shrink-0 sm:self-center">
                            <Link href={`/test?id=${test.id}`}>
                              <button className={cn(
                                "h-9 px-4 rounded-xl font-bold text-xs transition-all shadow-sm",
                                testAttempt?.passed
                                  ? 'bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white'
                                  : 'bg-primary hover:bg-primary/95 text-white'
                              )}>
                                {testAttempt ? 'Retake Test' : 'Start Exam'}
                              </button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 5: CERTIFICATES & SUBMISSIONS HISTORY */}
            {activeTab === 'certificate' && (
              <motion.div
                key="certificate"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-200 dark:border-white/5 pb-4 mb-4">
                  <h1 className="text-2xl font-headline font-bold">Trace Logs & Allotted Certificates</h1>
                  <p className="text-xs text-slate-400">History log of all completed assessments and download links for verified certificates.</p>
                </div>

                {loadingTests ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p className="text-xs font-bold uppercase tracking-wider">Retrieving logs...</p>
                  </div>
                ) : attempts.length === 0 ? (
                  <div className="text-center py-16 border border-dashed rounded-3xl border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950/20">
                    <CertificateIcon className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">No submissions found</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Start an allotted assessment in the tab above. Passed exams will generate verified certificates here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {attempts.map((attempt) => (
                      <div key={attempt.id} className="p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{attempt.test_title || 'Assessment'}</span>
                            {attempt.passed ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Passed</span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">Failed</span>
                            )}
                            
                            {attempt.type === 'contest' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">🏆 Contest</span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold text-slate-400">
                            <span>Score: <span className="text-slate-900 dark:text-white">{attempt.score}/{attempt.total_marks} ({attempt.percentage}%)</span></span>
                            {attempt.time_spent !== undefined && (
                              <span>Time: {Math.round(attempt.time_spent / 60)} min {attempt.time_spent % 60}s</span>
                            )}
                            <span>Submitted: {new Date(attempt.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-4">
                          {attempt.passed && (
                            <button
                              onClick={async () => {
                                try {
                                  const response = await fetch('/api/certificates/generate', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ examId: attempt.test_id, attemptId: attempt.id }),
                                  });
                                  const data = await response.json();
                                  if (data.success) {
                                    window.open(`/verify-certificate/${data.certificateId}`, '_blank');
                                  } else {
                                    alert(data.error || 'Failed to generate certificate');
                                  }
                                } catch (e) {
                                  console.error(e);
                                  alert('An error occurred during certificate generation.');
                                }
                              }}
                              className="h-9 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-750 text-white font-bold text-[10px] transition-colors flex items-center gap-1.5 shadow shadow-emerald-500/10"
                            >
                              <Award className="h-3.5 w-3.5" /> Get Certificate
                            </button>
                          )}
                          <div className="text-right">
                            <span className="text-sm font-black text-indigo-500 block">{attempt.percentage}%</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Score</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </main>

      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 dark:bg-[#04060E] py-16">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase">Syncing Dashboard...</p>
        </div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
