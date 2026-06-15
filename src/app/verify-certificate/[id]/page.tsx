"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Award, Calendar, ShieldAlert, ArrowLeft, Download, ShieldCheck, Instagram, Youtube } from "lucide-react";

function VerifyCertificateContent() {
  const params = useParams();
  const certId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [certData, setCertData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (certId) {
      const verify = async () => {
        try {
          const res = await fetch(`/api/certificates/verify?id=${certId}`);
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to verify certificate");
          }
          const data = await res.json();
          setCertData(data);
        } catch (e: any) {
          setError(e.message || "Invalid certificate id.");
        } finally {
          setLoading(false);
        }
      };
      verify();
    }
  }, [certId]);

  const handleDownload = () => {
    if (certData?.fileType === 'pptx' && certData?.pptxData) {
      const link = document.createElement("a");
      link.href = `data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,${certData.pptxData}`;
      link.download = `Certificate_${certId}.pptx`;
      link.click();
    } else if (certData?.pdfData) {
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${certData.pdfData}`;
      link.download = `Certificate_${certId}.pdf`;
      link.click();
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
        <div className="max-w-md w-full text-center space-y-6 px-6">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/10 animate-pulse" />
            <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Award className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-headline font-bold text-lg text-slate-900 dark:text-white">Verifying Certificate Integrity</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Performing cryptographic handshake with validation keys...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !certData) {
    return (
      <div className="w-full h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
        <div className="text-center space-y-4 max-w-sm w-full bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-xl">
          <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold">Verification Failed</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{error || "The requested certificate is invalid or has been revoked."}</p>
          <Link href="/" className="inline-block w-full">
            <button className="w-full h-11 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white font-bold transition-all duration-200">
              Return Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 py-16 relative overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-body">
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
          <div className="absolute -inset-0.5 rounded-[2rem] blur opacity-25 dark:opacity-45 group-hover:opacity-60 transition duration-700 pointer-events-none bg-gradient-to-r from-primary to-accent" />
          
          <div className="relative p-6 sm:p-8 rounded-[2rem] border backdrop-blur-2xl shadow-xl space-y-6 bg-white/95 dark:bg-slate-950/80 border-slate-200 dark:border-white/10 text-center text-slate-900 dark:text-white">
            
            <div 
              className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto border"
              style={{ backgroundColor: 'hsla(var(--primary), 0.1)', borderColor: 'hsla(var(--primary), 0.2)', color: 'hsl(var(--primary))' }}
            >
              <ShieldCheck className="h-8 w-8 animate-bounce" />
            </div>

            <div className="space-y-1">
              <span 
                className="text-[10px] tracking-widest font-black px-3 py-1 rounded-full uppercase border"
                style={{ backgroundColor: 'hsla(var(--primary), 0.1)', borderColor: 'hsla(var(--primary), 0.2)', color: 'hsl(var(--primary))' }}
              >
                Cryptographically Verified
              </span>
              <h1 className="text-xl font-headline font-black text-slate-900 dark:text-white pt-3">Credential Verification</h1>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-white/5 space-y-4 text-left text-xs">
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
                <span className="text-slate-500 dark:text-slate-400">Certificate Key</span>
                <span className="font-mono font-bold text-primary">{certData.certificateId}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleDownload}
                className="w-full h-11 text-xs font-bold bg-primary hover:opacity-90 text-white rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-primary/10 transition-all"
              >
                <Download className="h-4 w-4" /> Download {certData?.fileType === 'pptx' ? 'PPTX' : 'PDF'}
              </button>
              <Link href="/" className="w-full">
                <button className="w-full h-11 text-xs font-bold border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                  <ArrowLeft className="h-4 w-4" /> Return Home
                </button>
              </Link>
            </div>

            {/* Social media shortcuts */}
            <div className="flex items-center justify-center gap-6 pt-6 border-t border-slate-200/60 dark:border-white/5 w-full mt-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5 text-xs font-semibold">
                <Instagram className="h-4 w-4" /> Instagram
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1.5 text-xs font-semibold">
                <Youtube className="h-4 w-4" /> YouTube
              </a>
              <a href="https://wa.me" target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-xs font-semibold">
                <span className="font-bold">WA</span> WhatsApp
              </a>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function VerifyCertificatePage() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
        <div className="max-w-md w-full text-center space-y-6 px-6">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/10 animate-pulse" />
            <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Award className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-headline font-bold text-lg text-slate-900 dark:text-white">Verifying Certificate Integrity</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Performing cryptographic handshake with validation keys...</p>
          </div>
        </div>
      </div>
    }>
      <VerifyCertificateContent />
    </Suspense>
  );
}
