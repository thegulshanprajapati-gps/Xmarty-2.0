'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/db';
import {
  GraduationCap, Eye, EyeOff, ArrowRight, Loader2,
  LogOut, LayoutDashboard, ShieldCheck, BookOpen,
  Users, ClipboardList, CheckCircle2
} from 'lucide-react';

export default function InstructorLogin() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const sessionStr = localStorage.getItem('xmarty_session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        const role = session?.user?.role;
        if (['super_admin', 'admin', 'editor', 'instructor'].includes(role)) {
          setSessionUser(session.user);
        }
      }
    } catch {}
    setCheckingSession(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await db.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ variant: 'destructive', title: 'Login Failed', description: error.message || 'Invalid credentials.' });
        return;
      }
      const role = data?.user?.role;
      if (!['super_admin', 'admin', 'editor', 'instructor'].includes(role)) {
        toast({ variant: 'destructive', title: 'Access Denied', description: 'This portal is for Instructors & Admins only.' });
        await db.auth.signOut();
        return;
      }
      toast({ title: '✓ Welcome back!', description: `Signed in as ${role?.replace('_', ' ').toUpperCase()}` });
      router.push('/');
      setTimeout(() => window.location.reload(), 100);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await db.auth.signOut();
    localStorage.removeItem('xmarty_session');
    setSessionUser(null);
    toast({ title: 'Signed Out', description: 'Your session has been ended.' });
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <Loader2 className="h-7 w-7 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#faf8f5]">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] flex-col justify-between bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-amber-700/30" />
        <div className="absolute bottom-32 right-8 w-32 h-32 rounded-full bg-white/10" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <span className="text-white font-black text-base tracking-tighter">XC</span>
            </div>
            <div>
              <p className="text-white font-black text-lg leading-none tracking-tight">XmartyCreator</p>
              <p className="text-amber-100/70 text-[11px] font-bold uppercase tracking-widest mt-0.5">Instructor Portal</p>
            </div>
          </div>
        </div>

        {/* Main panel content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
              Teach.<br />
              <span className="text-amber-100">Inspire.</span><br />
              Empower.
            </h1>
            <p className="mt-5 text-amber-100/80 text-base font-medium leading-relaxed max-w-sm">
              Your complete instructor workspace. Build courses, manage students, create assessments — all in one place.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: BookOpen, text: 'Course Builder & Curriculum Designer' },
              { icon: ClipboardList, text: 'Test & Assessment Builder' },
              { icon: Users, text: 'Student Enrollment & Progress Tracking' },
            ].map((feat) => (
              <div key={feat.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <feat.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-amber-50/90 text-sm font-medium">{feat.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom branding */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 w-fit">
            <ShieldCheck className="w-4 h-4 text-amber-200" />
            <span className="text-amber-100 text-xs font-bold">RBAC v2 Secured · Enterprise Grade</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">

        {/* Mobile logo */}
        <div className="flex items-center gap-3 mb-8 lg:hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-black text-base text-gray-900">XmartyCreator</p>
            <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">Instructor Portal</p>
          </div>
        </div>

        <div className="w-full max-w-[420px]">
          <AnimatePresence mode="wait">

            {/* ── SESSION ACTIVE ── */}
            {sessionUser ? (
              <motion.div
                key="active"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-gray-900">Already Signed In</h2>
                  <p className="text-gray-500 text-sm mt-1">You have an active instructor session.</p>
                </div>

                {/* User info card */}
                <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 p-5 mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-amber-300/40">
                      {sessionUser.email?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate text-sm">{sessionUser.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
                          {sessionUser.role?.replace('_', ' ')}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleLogout}
                    className="h-12 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                  <button
                    onClick={() => {
                      if (sessionUser?.role !== 'instructor') {
                        window.location.href = 'http://localhost:4000/';
                      } else {
                        router.push('/');
                      }
                    }}
                    className="h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm hover:from-amber-600 hover:to-orange-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-amber-400/30 hover:shadow-amber-400/50 hover:scale-[1.01]"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ) : (

              /* ── LOGIN FORM ── */
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-200 mb-4">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-700" />
                    <span className="text-[11px] font-black text-amber-700 uppercase tracking-wider">Instructor Access</span>
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 leading-tight">
                    Welcome back,<br />
                    <span className="text-amber-500">Instructor.</span>
                  </h2>
                  <p className="text-gray-400 text-sm mt-2 font-medium">Sign in to access your teaching workspace.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="instructor@xmartycreator.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-sm font-medium placeholder:text-gray-300 outline-none transition-all duration-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        className="w-full h-12 pl-4 pr-12 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-sm font-medium placeholder:text-gray-300 outline-none transition-all duration-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading || !email || !password}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm transition-all duration-200 shadow-lg shadow-amber-400/30 hover:shadow-amber-400/50 hover:from-amber-600 hover:to-orange-600 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        Sign In to Workspace
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="my-6 flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Portal Info</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {/* Info pills */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: BookOpen, label: 'Courses' },
                    { icon: ClipboardList, label: 'Tests' },
                    { icon: Users, label: 'Students' },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <item.icon className="w-4 h-4 text-amber-500" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{item.label}</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-8 flex items-center justify-between">
                  <p className="text-[11px] text-gray-300 font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    RBAC Protected
                  </p>
                  <a
                    href={process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'http://localhost:3000'}
                    className="text-[11px] text-gray-400 hover:text-amber-500 font-bold transition-colors"
                  >
                    ← Public Platform
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}