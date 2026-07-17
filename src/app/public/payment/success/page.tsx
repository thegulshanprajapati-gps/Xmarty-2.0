'use client';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div className="w-full min-h-screen bg-[#FAFCFF] dark:bg-[#030712] flex items-center justify-center py-20 px-4 relative overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full p-8 rounded-[32px] bg-white dark:bg-slate-950/40 border border-slate-200/80 dark:border-white/5 shadow-2xl space-y-6 text-center relative z-10">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="h-10 w-10 animate-bounce" />
          </div>
        </div>

        <div className="space-y-2">
          <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-md">
            Payment Verified
          </Badge>
          <h1 className="text-2xl font-black font-headline tracking-tight">Order Placed Successfully!</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
            Your transaction has been processed securely. Course access has been provisioned, and your invoice has been generated.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-3">
          <Button asChild className="w-full h-11 bg-primary text-primary-foreground text-xs font-black rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
            <Link href="/profile?tab=courses">
              Access My Courses <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          
          <Button asChild variant="ghost" className="w-full h-10 text-xs font-bold text-slate-550 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl">
            <Link href="/profile?tab=certificate">
              View Generated Certificates
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
