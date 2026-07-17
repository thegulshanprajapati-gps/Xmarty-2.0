'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/plans');
      const data = await res.json();
      if (data.success) {
        setPlans(data.plans || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  if (loading) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center bg-[#FAFCFF] dark:bg-[#030712] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[3px] border-primary/10 border-t-primary animate-spin" />
          <div className="absolute inset-2 rounded-full border-[3px] border-indigo-500/5 border-b-indigo-500/40 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary/20 to-indigo-500/20 backdrop-blur-md border border-white/20 dark:border-white/5 animate-pulse" />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-4 animate-pulse">LOADING SUBSCRIPTION PLANS...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FAFCFF] dark:bg-[#030712] py-20 px-4 relative overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Dynamic radial glow backgrounds */}
      <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[450px] h-[450px] bg-indigo-500/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10 text-center">
        
        {/* Header */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <Badge className="bg-primary/10 text-primary border border-primary/20 px-3.5 py-1 rounded-full font-bold text-xs uppercase tracking-widest">
            Membership Pricing
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-black font-headline tracking-tight leading-tight">
            Choose Your Creative Membership Plan
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
            Gain unlimited access to expert courses, private peer channels, assessments, and automated verifications certificates.
          </p>
        </div>

        {/* Billing Toggle Switch */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <span className={`text-xs font-bold transition-all ${billingCycle === 'monthly' ? 'text-primary' : 'text-slate-400'}`}>Monthly Billing</span>
          <button
            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
            className="w-14 h-8 bg-slate-200 dark:bg-slate-800 rounded-full p-1 transition-all duration-300 shadow-inner flex items-center relative"
          >
            <div className={`w-6 h-6 bg-white dark:bg-slate-950 rounded-full shadow-md transform transition-all duration-300 ${billingCycle === 'yearly' ? 'translate-x-6 bg-primary' : ''}`} />
          </button>
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-bold transition-all ${billingCycle === 'yearly' ? 'text-primary' : 'text-slate-400'}`}>Yearly Billing</span>
            <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black uppercase px-2 py-0.5 rounded-md">Save 20%</Badge>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          {plans.map((plan: any) => {
            const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
            const savings = billingCycle === 'yearly' ? `Save ${(plan.monthlyPrice * 12 - plan.yearlyPrice)} INR/yr` : '';
            return (
              <div 
                key={plan.id || plan._id} 
                className={`relative group rounded-[32px] bg-white dark:bg-slate-900/40 border p-8 flex flex-col justify-between text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${plan.popular ? 'border-primary shadow-xl ring-1 ring-primary/20 bg-gradient-to-b from-primary/[0.02] to-transparent' : 'border-slate-200/80 dark:border-white/5 shadow-md'}`}
              >
                {plan.badge && (
                  <Badge className="absolute top-6 right-6 bg-primary text-primary-foreground text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {plan.badge}
                  </Badge>
                )}

                <div className="space-y-6">
                  <div className="space-y-2">
                    <span className="text-xs text-slate-400 uppercase tracking-widest font-black block">Membership Plan</span>
                    <h3 className="text-2xl font-black tracking-tight">{plan.name}</h3>
                    <p className="text-xs text-slate-450 leading-relaxed font-semibold">{plan.description}</p>
                  </div>

                  <div className="py-2 border-y border-slate-100 dark:border-white/5 space-y-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black tracking-tight">{price} INR</span>
                      <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">/ {billingCycle === 'yearly' ? 'year' : 'month'}</span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <span className="text-[9px] text-emerald-500 font-bold block">{savings}</span>
                    )}
                  </div>

                  {/* Feature Lists */}
                  <ul className="space-y-3 pt-2">
                    {(plan.features || []).map((feat: string, i: number) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <Button asChild className={`w-full h-11 rounded-xl text-xs font-black shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-1.5 ${plan.popular ? 'bg-primary text-primary-foreground shadow-primary/20' : 'bg-slate-200 dark:bg-white/10 hover:bg-slate-350 dark:hover:bg-white/15 text-slate-800 dark:text-white border border-transparent dark:border-white/5'}`}>
                    <Link href={`/public/checkout?type=Subscription&targetId=${plan._id || plan.id}:${billingCycle}`}>
                      Subscribe Now <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Disclaimers */}
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase pt-8">
          All payments processed securely. 18% GST applies at checkout. Refund requests subject to standard verification.
        </p>

      </div>
    </div>
  );
}
