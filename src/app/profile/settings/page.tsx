'use client';

import Link from "next/link";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User, Lock, Phone, Camera, Save, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user) {
      setName(user.full_name || "");
      setMobileNumber(user.mobile_number || "");
      setProfilePicture(user.profile_picture || "");
    }
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: "error", text: "Image size should be less than 2MB" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch('/api/auth/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: name,
          mobile_number: mobileNumber,
          profile_picture: profilePicture,
          password: password || undefined
        })
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Profile updated successfully! Redirecting..." });
        setPassword("");
        setTimeout(() => {
          router.push('/profile');
        }, 1000);
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "Failed to update profile" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An error occurred while saving details." });
    } finally {
      setUpdating(false);
    }
  };

  if (userLoading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-slate-50 dark:bg-[#04060E] py-16">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full flex items-center justify-center p-4 py-16 bg-slate-50 dark:bg-[#04060E] text-slate-900 dark:text-white">
        <div className="text-center space-y-4 max-w-sm w-full bg-white dark:bg-slate-950/80 p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-xl">
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
    <div className="w-full min-h-screen p-4 py-12 relative overflow-hidden transition-colors duration-300 bg-slate-50 dark:bg-[#04060E] text-slate-900 dark:text-white">
      {/* Background Lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden dark:block">
        <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[15%] -right-[10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto space-y-8">
        {/* Navigation & Logout header */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/5 pb-5">
          <div className="space-y-1">
            <Link href="/profile" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition duration-200 group py-1">
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-headline font-bold tracking-tight">Account Settings</h1>
          </div>
        </div>

        {/* Profile Card & Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 rounded-[2rem] blur opacity-30 group-hover:opacity-40 transition duration-700 pointer-events-none bg-gradient-to-r from-primary to-indigo-500 hidden dark:block" />
          
          <div className="relative p-6 sm:p-8 rounded-[2rem] border backdrop-blur-2xl shadow-xl space-y-6 bg-white dark:bg-slate-950/80 border-slate-200 dark:border-white/10">
            
            {message.text && (
              <div className={`rounded-xl p-3 text-xs font-semibold ${
                message.type === 'success' 
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-destructive/10 border border-destructive/20 text-rose-500'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-6">
              
              {/* Picture Upload Area */}
              <div className="flex flex-col items-center space-y-3 pb-4 border-b border-slate-100 dark:border-white/5">
                <div className="relative group/avatar">
                  <div className="h-28 w-28 rounded-full border-4 border-primary/20 overflow-hidden bg-slate-800 flex items-center justify-center shadow-inner relative">
                    {profilePicture ? (
                      <img src={profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-slate-500" />
                    )}
                  </div>
                  <label htmlFor="avatar-file" className="absolute bottom-0 right-0 h-9 w-9 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-all">
                    <Camera className="h-4.5 w-4.5" />
                  </label>
                  <input
                    type="file"
                    id="avatar-file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Profile Picture</span>
                  <span className="text-[9px] text-slate-500">Max size 2MB (jpg/png)</span>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1 block">Full Name</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input 
                      required 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="Enter your name" 
                      className="w-full h-11 pl-11 pr-4 rounded-xl border outline-none transition-all duration-200 text-sm border-slate-200 bg-slate-50 text-slate-950 focus:border-primary/60 focus:bg-white dark:border-white/10 dark:bg-slate-900/40 dark:text-white dark:focus:border-primary/60 dark:focus:bg-slate-900/60"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1 block">Mobile Number</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Phone className="h-4 w-4" />
                    </div>
                    <input 
                      type="tel" 
                      value={mobileNumber} 
                      onChange={(e) => setMobileNumber(e.target.value)} 
                      placeholder="e.g. +91 9876543210" 
                      className="w-full h-11 pl-11 pr-4 rounded-xl border outline-none transition-all duration-200 text-sm border-slate-200 bg-slate-50 text-slate-950 focus:border-primary/60 focus:bg-white dark:border-white/10 dark:bg-slate-900/40 dark:text-white dark:focus:border-primary/60 dark:focus:bg-slate-900/60"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1 block">Image URL (Optional)</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input 
                      type="text" 
                      value={profilePicture.startsWith("data:") ? "" : profilePicture} 
                      onChange={(e) => setProfilePicture(e.target.value)} 
                      placeholder="Direct image URL" 
                      className="w-full h-11 pl-11 pr-4 rounded-xl border outline-none transition-all duration-200 text-sm border-slate-200 bg-slate-50 text-slate-950 focus:border-primary/60 focus:bg-white dark:border-white/10 dark:bg-slate-900/40 dark:text-white dark:focus:border-primary/60 dark:focus:bg-slate-900/60"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1 block">New Password (Optional)</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input 
                      type={visible ? 'text' : 'password'} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="Enter new password" 
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
              </div>

              <button 
                type="submit" 
                disabled={updating} 
                className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-rose-600 text-white font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 text-sm mt-3"
              >
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Settings
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
