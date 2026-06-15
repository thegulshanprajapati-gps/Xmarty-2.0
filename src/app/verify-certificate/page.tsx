"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Award, ShieldCheck, ShieldAlert, ArrowLeft, Download, Calendar, Search, Instagram, Youtube } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function VerifyCertificatePortal() {
  const [certId, setCertId] = useState("");
  const [loading, setLoading] = useState(false);
  const [certData, setCertData] = useState<any>(null);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certId.trim()) return;

    setLoading(true);
    setError("");
    setCertData(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/certificates/verify?id=${certId.trim()}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Invalid Certificate ID. This credential could not be verified.");
      }
      const data = await res.json();
      setCertData(data);
    } catch (e: any) {
      setError(e.message || "Invalid certificate ID.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (certData?.pdfData) {
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${certData.pdfData}`;
      link.download = `Certificate_${certData.certificateId}.pdf`;
      link.click();
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 py-16 relative overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-body select-none">
      {/* Dynamic background lights */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] pointer-events-none" 
        style={{ backgroundColor: 'hsl(var(--primary))', opacity: 0.08 }}
      />
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] pointer-events-none" 
        style={{ backgroundColor: 'hsl(var(--accent))', opacity: 0.08 }}
      />

      <div className="relative z-10 w-full max-w-lg mx-auto">
        <motion.div 
          initial={{ y: 15, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ duration: 0.4, ease: "easeOut" }} 
          className="relative group"
        >
          {/* Neon backdrop border glow */}
          <div className="absolute -inset-0.5 rounded-[2.2rem] blur opacity-25 dark:opacity-45 group-hover:opacity-60 transition duration-700 pointer-events-none bg-gradient-to-r from-primary to-accent" />
          
          <div className="relative p-6 sm:p-8 rounded-[2.2rem] border backdrop-blur-2xl shadow-xl space-y-6 bg-white/95 dark:bg-slate-950/80 border-slate-200 dark:border-white/10 text-center text-slate-900 dark:text-white">
            
            <div 
              className="h-16 w-16 rounded-2.5xl flex items-center justify-center mx-auto border shadow-sm"
              style={{ backgroundColor: 'hsla(var(--primary), 0.1)', borderColor: 'hsla(var(--primary), 0.2)', color: 'hsl(var(--primary))' }}
            >
              <Award className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-headline font-black tracking-tight text-slate-900 dark:text-white">Verification Engine</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Validate credential keys and verify dynamic integrity against the secure central register.
              </p>
            </div>

            {/* Input Form */}
            <form onSubmit={handleVerify} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400 pl-1">
                  Certificate Security Key
                </label>
                <div className="relative">
                  <Input 
                    placeholder="e.g. CERT-EF4460C" 
                    value={certId}
                    onChange={(e) => setCertId(e.target.value)}
                    className="h-12 bg-slate-100/50 dark:bg-slate-900/50 border-slate-200 dark:border-white/10 rounded-xl pl-4 pr-12 focus-visible:ring-primary focus-visible:border-primary text-sm font-mono text-slate-900 dark:text-white tracking-wider"
                  />
                  <button 
                    type="submit" 
                    disabled={loading || !certId.trim()} 
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-primary hover:opacity-90 transition-opacity flex items-center justify-center text-white disabled:opacity-40"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </form>

            {/* Status Panel / Result Panel */}
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-8 rounded-2xl bg-slate-100/40 dark:bg-slate-900/30 border border-slate-200/50 dark:border-white/5 space-y-3"
                >
                  <div className="relative w-12 h-12 mx-auto">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/10 animate-pulse" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Verifying Record Integrity</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Connecting to credential register...</p>
                  </div>
                </motion.div>
              )}

              {!loading && searched && error && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-center space-y-3"
                >
                  <ShieldAlert className="h-10 w-10 text-rose-500 mx-auto" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Verification Failed</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{error}</p>
                  </div>
                </motion.div>
              )}

              {!loading && searched && certData && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 text-left"
                >
                  <div className="p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-white/5 space-y-3.5 text-xs">
                    <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-white/5 pb-3 justify-center text-center">
                      <ShieldCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                      <span className="text-[10px] tracking-widest font-black text-emerald-500 dark:text-emerald-400 uppercase">
                        Verified Credentials Match
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200/60 dark:border-white/5 pb-2">
                      <span className="text-slate-500 dark:text-slate-400">Student Name</span>
                      <span className="font-bold text-slate-900 dark:text-white">{certData.studentName}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200/60 dark:border-white/5 pb-2">
                      <span className="text-slate-500 dark:text-slate-400">Assessment Title</span>
                      <span className="font-bold text-slate-900 dark:text-white">{certData.examTitle}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200/60 dark:border-white/5 pb-2">
                      <span className="text-slate-500 dark:text-slate-400">Credential Type</span>
                      <span className="font-bold text-slate-900 dark:text-white capitalize">{certData.type === 'participation' ? 'Participation' : 'Completion'}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200/60 dark:border-white/5 pb-2">
                      <span className="text-slate-500 dark:text-slate-400">Date Verified</span>
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-primary" />
                        {new Date(certData.generatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">Registry Key</span>
                      <span className="font-mono font-bold text-primary">{certData.certificateId}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="w-full h-11 text-xs font-bold bg-primary hover:opacity-90 text-white rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-primary/10 transition-all"
                    >
                      <Download className="h-4 w-4" /> Download PDF
                    </button>
                    <Link href="/" className="w-full">
                      <button className="w-full h-11 text-xs font-bold border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                        <ArrowLeft className="h-4 w-4" /> Return Home
                      </button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!searched && (
              <div className="grid grid-cols-1 gap-2 pt-2">
                <Link href="/" className="w-full">
                  <button className="w-full h-11 text-xs font-bold border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Return Home
                  </button>
                </Link>
              </div>
            )}

            {/* Social media footer */}
            <div className="flex items-center justify-center gap-6 pt-6 border-t border-slate-200/60 dark:border-white/5 w-full mt-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5 text-xs font-semibold">
                <Instagram className="h-4 w-4" /> Instagram
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1.5 text-xs font-semibold">
                <Youtube className="h-4 w-4" /> YouTube
              </a>
              <a href="https://wa.me" target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-xs font-semibold">
                <span className="font-bold text-xs">WA</span> WhatsApp
              </a>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return (
    <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} />
  );
}
