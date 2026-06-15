"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 py-16 relative overflow-hidden transition-colors duration-300 bg-slate-950 text-white font-sans">
      
      {/* Background Neon Lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
          {/* Card Border Glow */}
          <div className="absolute -inset-0.5 rounded-[2rem] blur opacity-40 group-hover:opacity-60 transition duration-700 pointer-events-none bg-gradient-to-r from-primary to-accent" />
          
          {/* Main Card */}
          <div className="relative p-8 rounded-[2rem] border backdrop-blur-2xl shadow-xl space-y-6 bg-slate-950/80 border-white/10 shadow-none text-center">
            
            {/* Shield Icon */}
            <div className="h-16 w-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto border border-rose-500/20">
              <ShieldAlert className="h-8 w-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-headline font-bold tracking-tight text-white">Access Denied</h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                You do not have the required permissions to view this resource. Contact your administrator if you believe this is a mistake.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4">
              <Link href="/login" className="w-full">
                <button className="w-full h-11 text-xs font-bold border border-white/10 hover:bg-white/5 text-slate-300 rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                  <ArrowLeft className="h-4 w-4" /> Sign In
                </button>
              </Link>
              <Link href="/" className="w-full">
                <button className="w-full h-11 text-xs font-bold bg-primary hover:opacity-90 text-white rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-primary/10 transition-all">
                  <Home className="h-4 w-4" /> Home
                </button>
              </Link>
            </div>

            {/* Social media shortcuts */}
            <div className="flex items-center justify-center gap-6 pt-6 border-t border-white/5 w-full mt-4">
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
        </motion.div>
      </div>
    </div>
  );
}
