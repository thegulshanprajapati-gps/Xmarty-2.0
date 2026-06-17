"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/use-user";
import { ShieldCheck, ArrowRight, Loader2, Lock, LayoutDashboard, LogOut } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }); } catch {}
    try { localStorage.removeItem('xmarty_session'); } catch {}
    window.location.href = '/';
  };

  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'instructor') {
      router.push('/profile');
    }
  }, [user, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: name, role: 'student' })
      });
      
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Could not create account. Please verify your information and try again.");
      } else {
        router.push('/profile');
        window.location.reload();
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-slate-50 dark:bg-[#04060E] py-16">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading session...</p>
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-200 dark:border-white/5 w-64 mt-2">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1.5 text-xs font-semibold">
              <i className="fa-brands fa-instagram text-base"></i> Instagram
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1.5 text-xs font-semibold">
              <i className="fa-brands fa-youtube text-base"></i> YouTube
            </a>
            <a href="https://wa.me" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-500 transition-colors flex items-center gap-1.5 text-xs font-semibold">
              <i className="fa-brands fa-whatsapp text-base"></i> WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center p-4 py-16 relative overflow-hidden transition-colors duration-300 bg-slate-50 dark:bg-[#04060E] text-slate-900 dark:text-white">
      
      {/* Background Lights (Only visible in Dark Mode) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden dark:block">
        <div className="absolute -top-[10%] -left-[10%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[15%] -right-[10%] w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto">
        <motion.div 
          initial={{ y: 15, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ duration: 0.4, ease: "easeOut" }} 
          className="relative group"
        >
          {/* Card Border Glow in Dark Mode */}
          <div className="absolute -inset-0.5 rounded-[2rem] blur opacity-40 group-hover:opacity-60 transition duration-700 pointer-events-none bg-gradient-to-r from-primary to-accent hidden dark:block" />
          
          {/* Main Card */}
          {user && (user.role === 'admin' || user.role === 'super_admin' || user.role === 'instructor') ? (
            <div className="relative p-6 sm:p-8 rounded-[2rem] border backdrop-blur-2xl shadow-xl space-y-6 bg-white dark:bg-slate-950/80 border-slate-200 dark:border-white/10 shadow-slate-200/50 dark:shadow-none">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-black text-base shadow-md">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-headline font-bold tracking-tight text-slate-900 dark:text-white">Already Logged In</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Authorized session active.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-amber-200/50 bg-amber-500/[0.03] space-y-1 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Logged in as</p>
                <p className="font-bold text-sm text-foreground">{user.email}</p>
                <span className="inline-block px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mt-1">
                  {user.role?.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl h-11 text-xs font-bold border border-rose-200/50 hover:bg-rose-500/10 text-rose-600 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Log Out
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (user.role === 'instructor') {
                      window.location.href = 'http://localhost:5000/';
                    } else {
                      window.location.href = 'http://localhost:4000/';
                    }
                  }}
                  className="rounded-xl h-11 text-xs font-bold bg-primary hover:bg-primary/95 text-white flex items-center justify-center gap-1.5 shadow-md shadow-primary/10 transition-all"
                >
                  <LayoutDashboard className="h-4 w-4" /> Console <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ) : (
            <div className="relative p-6 sm:p-8 rounded-[2rem] border backdrop-blur-2xl shadow-xl space-y-6 bg-white dark:bg-slate-950/80 border-slate-200 dark:border-white/10 shadow-slate-200/50 dark:shadow-none">
              
              {/* Header info */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                  <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
                </div>
                <div>
                  <h1 className="text-xl font-headline font-bold tracking-tight text-slate-900 dark:text-white">Create Account</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Get started today.</p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-rose-400 font-semibold">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1 block">Full Name</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <i className="fa-solid fa-user"></i>
                    </div>
                    <input 
                      required 
                      id="name"
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="John Doe" 
                      className="w-full h-11 pl-11 pr-4 rounded-xl border outline-none transition-all duration-200 text-sm border-slate-200 bg-slate-50 text-slate-950 focus:border-primary/60 focus:bg-white dark:border-white/10 dark:bg-slate-900/40 dark:text-white dark:focus:border-primary/60 dark:focus:bg-slate-900/60"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1 block">Email Address</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <i className="fa-solid fa-envelope"></i>
                    </div>
                    <input 
                      required 
                      id="email"
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="john@example.com" 
                      className="w-full h-11 pl-11 pr-4 rounded-xl border outline-none transition-all duration-200 text-sm border-slate-200 bg-slate-50 text-slate-950 focus:border-primary/60 focus:bg-white dark:border-white/10 dark:bg-slate-900/40 dark:text-white dark:focus:border-primary/60 dark:focus:bg-slate-900/60"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1 block">Password</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <i className="fa-solid fa-lock"></i>
                    </div>
                    <input 
                      required 
                      id="password"
                      type={visible ? "text" : "password"} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="••••••••" 
                      className="w-full h-11 pl-11 pr-11 rounded-xl border outline-none transition-all duration-200 text-sm border-slate-200 bg-slate-50 text-slate-950 focus:border-primary/60 focus:bg-white dark:border-white/10 dark:bg-slate-900/40 dark:text-white dark:focus:border-primary/60 dark:focus:bg-slate-900/60"
                    />
                    <button 
                      type="button" 
                      onClick={() => setVisible(!visible)} 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition duration-200 p-1"
                    >
                      <i className={`fa-solid ${visible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1 block">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <i className="fa-solid fa-lock"></i>
                    </div>
                    <input 
                      required 
                      id="confirmPassword"
                      type={confirmVisible ? "text" : "password"} 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      placeholder="••••••••" 
                      className="w-full h-11 pl-11 pr-11 rounded-xl border outline-none transition-all duration-200 text-sm border-slate-200 bg-slate-50 text-slate-950 focus:border-primary/60 focus:bg-white dark:border-white/10 dark:bg-slate-900/40 dark:text-white dark:focus:border-primary/60 dark:focus:bg-slate-900/60"
                    />
                    <button 
                      type="button" 
                      onClick={() => setConfirmVisible(!confirmVisible)} 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition duration-200 p-1"
                    >
                      <i className={`fa-solid ${confirmVisible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-rose-600 text-white font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 text-sm mt-4"
                >
                  {loading ? (
                    <span>
                      <i className="fa-solid fa-spinner animate-spin mr-2"></i>
                      Registering...
                    </span>
                  ) : (
                    <>
                      Sign Up
                      <i className="fa-solid fa-arrow-right"></i>
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-slate-200 dark:bg-white/5" />
                  <div className="text-[9px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500">Or register with</div>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-white/5" />
                </div>

                {/* OAuth Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button" 
                    className="flex items-center justify-center gap-2 h-10 rounded-xl border text-xs font-semibold transition-all duration-200 border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.06] dark:text-white"
                  >
                    <i className="fa-brands fa-google text-rose-500 text-sm"></i>
                    Google
                  </button>
                  <button 
                    type="button" 
                    className="flex items-center justify-center gap-2 h-10 rounded-xl border text-xs font-semibold transition-all duration-200 border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.06] dark:text-white"
                  >
                    <i className="fa-brands fa-microsoft text-blue-500 text-sm"></i>
                    Microsoft
                  </button>
                </div>
              </form>

              {/* Footer */}
              <div className="text-center text-xs pt-1">
                <span className="text-slate-500 dark:text-slate-400">Already have an account? </span>
                <Link href="/login" className="font-bold text-primary hover:underline">
                  Sign In
                </Link>
              </div>

            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}


