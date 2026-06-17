"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Award, 
  Calendar, 
  ShieldAlert, 
  ArrowLeft, 
  Download, 
  ShieldCheck, 
  Share2, 
  Linkedin, 
  Copy, 
  Check, 
  Sparkles, 
  FileText,
  FileSpreadsheet
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

function VerifyCertificateContent() {
  const params = useParams();
  const certId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [certData, setCertData] = useState<any>(null);
  const [error, setError] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);

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

  const verificationUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/verify-certificate/${certId}`
    : `https://xmartycreator.com/verify-certificate/${certId}`;

  const shareCaption = `🎓 I'm proud to share that I have successfully completed the assessment for "${certData?.examTitle || 'Course'}" and earned my verified ${certData?.type === 'participation' ? 'Participation' : 'Completion'} Certificate! \n\nVerify my credential here: ${verificationUrl} \n\n#learning #certification #achievement #education`;

  const handleDownload = () => {
    if (certData?.fileType === 'pptx' && certData?.pptxData) {
      const link = document.createElement("a");
      link.href = `data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,${certData.pptxData}`;
      link.download = `Certificate_${certId}.pptx`;
      link.click();
      toast({ title: "PPTX Downloaded", description: "Your presentation template is ready." });
    } else if (certData?.pdfData) {
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${certData.pdfData}`;
      link.download = `Certificate_${certId}.pdf`;
      link.click();
      toast({ title: "PDF Downloaded", description: "Your digital certificate is saved." });
    }
  };

  const copyToClipboard = async (text: string, isCaption: boolean = false) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isCaption) {
        setCopiedCaption(true);
        setTimeout(() => setCopiedCaption(false), 2000);
        toast({ title: "Caption Copied!", description: "Share caption copied to clipboard." });
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
        toast({ title: "Link Copied!", description: "Verification link copied to clipboard." });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Copy Failed", description: "Please copy it manually." });
    }
  };

  const handleSharePlatform = (platform: 'linkedin' | 'whatsapp') => {
    // Copy caption immediately inside click event loop to avoid browser blocking
    try {
      const textarea = document.createElement("textarea");
      textarea.value = shareCaption;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      toast({ title: "Caption Auto-Copied!", description: "The caption has been copied to your clipboard. Paste it when sharing!" });
    } catch (e) {
      try {
        navigator.clipboard.writeText(shareCaption);
      } catch (err) {}
    }

    let shareUrl = "";
    if (platform === 'linkedin') {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verificationUrl)}`;
    } else if (platform === 'whatsapp') {
      shareUrl = `https://wa.me/?text=${encodeURIComponent(shareCaption)}`;
    }

    // Open immediately without timeout to satisfy popup-blocker restrictions
    window.open(shareUrl, "_blank", "noopener,noreferrer");
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
    <div className="w-full h-screen relative flex flex-col items-center justify-center p-3 lg:p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-body overflow-y-auto lg:overflow-hidden select-none">
      {/* Decorative Orbs */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full blur-[150px] pointer-events-none bg-primary/10 dark:bg-primary/5" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full blur-[150px] pointer-events-none bg-accent/10 dark:bg-accent/5" />

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch lg:h-full lg:max-h-[calc(100vh-2rem)] py-1">
        
        {/* LEFT COLUMN: Premium Preview & File View */}
        <div className="lg:col-span-7 flex flex-col justify-start lg:h-full">
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/5 rounded-[2rem] p-4 shadow-2xl flex flex-col h-[480px] lg:h-full w-full">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-white/5 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Official Document Preview</span>
              </div>
              {certData.fileType === 'pdf' ? (
                <span className="text-[9px] bg-red-500/10 text-red-500 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <FileText className="h-2.5 w-2.5" /> PDF format
                </span>
              ) : (
                <span className="text-[9px] bg-orange-500/10 text-orange-500 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <FileSpreadsheet className="h-2.5 w-2.5" /> PPTX format
                </span>
              )}
            </div>

            {/* Embedded interactive PDF or elegant mock visualizer */}
            <div className="flex-1 rounded-xl bg-slate-100/60 dark:bg-slate-950/40 border border-slate-200/50 dark:border-white/5 overflow-hidden relative w-full h-full flex items-center justify-center">
              {certData.fileType === 'pdf' && certData.pdfData ? (
                <iframe 
                  src={`data:application/pdf;base64,${certData.pdfData}#toolbar=0&navpanes=0&scrollbar=0&view=Fit&zoom=page-fit`} 
                  className="w-full h-full border-0 rounded-xl absolute inset-0"
                  title="Certificate Preview"
                />
              ) : (
                // Beautiful Fallback Mock Card for PPTX or if PDF fails
                <div className="p-4 text-center space-y-4 max-w-sm w-full relative">
                  <div className="absolute -inset-0.5 rounded-2xl blur-md bg-gradient-to-r from-amber-500/20 to-orange-500/20 opacity-50" />
                  <div className="relative border-4 border-double border-amber-500/40 p-4 rounded-xl bg-white dark:bg-slate-900 shadow-xl space-y-3">
                    <Award className="h-10 w-10 text-amber-500 mx-auto animate-pulse" />
                    <div>
                      <h4 className="font-headline text-base font-black tracking-tight text-slate-800 dark:text-slate-100 uppercase">{certData.studentName}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-widest font-semibold">Has completed the assessment for</p>
                      <p className="font-bold text-xs text-amber-600 dark:text-amber-400 mt-1">{certData.examTitle}</p>
                    </div>
                    <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[8px] text-slate-500 dark:text-slate-400 font-mono">
                      <span>ID: {certData.certificateId}</span>
                      <span>Verified: {new Date(certData.generatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Attractive Details, Downloads, Share Platform */}
        <div className="lg:col-span-5 flex flex-col justify-start lg:h-full">
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/5 rounded-[2rem] p-4 sm:p-5 shadow-2xl space-y-3 w-full lg:h-full flex flex-col justify-between overflow-y-auto">
            
            {/* Status Header */}
            <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2.5 rounded-xl text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5 shrink-0" />
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider">Verifiable Credential</p>
                <p className="text-[9px] text-emerald-600/80 dark:text-emerald-400/80">Valid and secure digital signature registered.</p>
              </div>
            </div>

            {/* Info Table */}
            <div className="space-y-4">
              <h2 className="text-lg font-headline font-black text-slate-900 dark:text-white">Credential Verification</h2>
              
              <div className="space-y-2 text-xs">
                {[
                  { label: "Student Name", value: certData.studentName },
                  { label: "Assessment Title", value: certData.examTitle },
                  { label: "Credential Type", value: certData.type === 'participation' ? '🏆 Certificate of Participation' : '🎓 Certificate of Completion' },
                  { label: "Date Issued", value: new Date(certData.generatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) },
                  { label: "Verification Key", value: certData.certificateId, isMono: true }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-white/5">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">{item.label}</span>
                    <span className={`font-bold text-slate-800 dark:text-white text-right max-w-[65%] truncate ${item.isMono ? 'font-mono text-primary' : ''}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1 shrink-0">
              <button
                onClick={handleDownload}
                className="w-full h-10 text-[11px] font-bold bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 transition-all duration-200"
              >
                <Download className="h-3.5 w-3.5" /> Download {certData?.fileType === 'pptx' ? 'PPTX' : 'PDF'}
              </button>
              <Link href="/" className="w-full">
                <button className="w-full h-10 text-[11px] font-bold border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 rounded-lg flex items-center justify-center gap-1.5 transition-colors duration-200">
                  <ArrowLeft className="h-3.5 w-3.5" /> Return Home
                </button>
              </Link>
            </div>

            {/* Premium Social Sharing Segment */}
            <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-2 shrink-0">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800 dark:text-slate-200">
                <Share2 className="h-3.5 w-3.5 text-primary" />
                <span>Share Verification & Showcase Success</span>
              </div>

              {/* Editable/Copyable Share Caption Container */}
              <div className="relative group">
                <div className="absolute top-1.5 right-1.5 z-20">
                  <button 
                    onClick={() => copyToClipboard(shareCaption, true)}
                    className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 transition-colors"
                    title="Copy Caption"
                  >
                    {copiedCaption ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
                <textarea 
                  readOnly
                  value={shareCaption}
                  className="w-full h-16 text-[10px] p-2 pr-8 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-white/5 resize-none outline-none font-mono text-slate-500 dark:text-slate-400 select-all leading-normal"
                />
              </div>

              {/* Platform Shortcuts */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSharePlatform('linkedin')}
                  className="h-9 rounded-lg bg-[#0077b5] text-white hover:opacity-90 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-opacity"
                >
                  <Linkedin className="h-3.5 w-3.5" /> Share to LinkedIn
                </button>
                <button
                  onClick={() => handleSharePlatform('whatsapp')}
                  className="h-9 rounded-lg bg-[#25d366] text-white hover:opacity-90 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-opacity"
                >
                  <span className="font-black text-xs">WA</span> Share to WhatsApp
                </button>
              </div>

              {/* Copy URL option */}
              <button
                onClick={() => copyToClipboard(verificationUrl)}
                className="w-full h-9 rounded-lg border border-dashed border-slate-300 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 font-semibold text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedLink ? "Link Copied!" : "Copy Verification URL"}
              </button>

            </div>

          </div>
        </div>

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

