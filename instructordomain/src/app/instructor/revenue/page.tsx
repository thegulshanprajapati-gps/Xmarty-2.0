'use client';

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Sparkles, DollarSign, Wallet, ArrowUpRight, TrendingUp } from "lucide-react";

export default function InstructorRevenuePage() {
  const [analytics, setAnalytics] = useState<any>({
    lifetimeEarnings: 84500,
    monthlyEarnings: 12400,
    courseEarnings: 62000,
    subEarnings: 22500,
    pendingPayout: 3200
  });

  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRevenueData = async () => {
    try {
      const res = await fetch('/api/instructor/revenue-data');
      const data = await res.json();
      if (data.success) {
        setPurchases(data.purchases || []);
        if (data.analytics) setAnalytics(data.analytics);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const chartData = [
    { name: "Week 1", Earnings: 2400 },
    { name: "Week 2", Earnings: 4100 },
    { name: "Week 3", Earnings: 3800 },
    { name: "Week 4", Earnings: 5900 }
  ];

  return (
    <div className="p-6 space-y-8 bg-[#FAFCFF] dark:bg-[#030712] min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-black font-headline tracking-tight">Earnings & Payouts Analytics</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Instructor contract payout matrices and organic course shares</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-[24px] border border-slate-200/80 dark:border-white/5 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-450 uppercase tracking-widest">Lifetime Earnings</CardTitle>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{analytics.lifetimeEarnings} INR</div>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Total revenue generated to-date</p>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border border-slate-200/80 dark:border-white/5 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-455 uppercase tracking-widest">Course sales share</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{analytics.courseEarnings} INR</div>
            <p className="text-[10px] text-slate-405 font-bold mt-1">Direct individual course enrollments</p>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border border-slate-200/80 dark:border-white/5 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-450 uppercase tracking-widest">Membership pool split</CardTitle>
            <Sparkles className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{analytics.subEarnings} INR</div>
            <p className="text-[10px] text-indigo-500 font-bold mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +15% pool weight
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border border-slate-200/80 dark:border-white/5 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-450 uppercase tracking-widest">Pending Payout Balance</CardTitle>
            <Badge className="bg-amber-500/10 text-amber-500 border-none px-2 py-0.5">Holding</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{analytics.pendingPayout} INR</div>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Next payout threshold release: 1st next month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 rounded-[24px] border border-slate-200/80 dark:border-white/5 p-6">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-450 mb-4">Weekly Performance curve</CardTitle>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-100 dark:stroke-white/5" />
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="Earnings" stroke="var(--primary)" strokeWidth={3} dot={{ strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Payout policies */}
        <Card className="rounded-[24px] border border-slate-200/80 dark:border-white/5 p-6 space-y-4">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-450">Payout Threshold Policies</CardTitle>
          <div className="space-y-3.5 pt-2 text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
            <p>1. Minimum payout trigger balance limit of 1,000 INR applies.</p>
            <p>2. Direct student individual sales are deposited after 7 business days cooling offset to buffer potential refund claims.</p>
            <p>3. Subscription pool shares are computed weight-proportionally to active watch hours tracked on your published courses.</p>
          </div>
        </Card>
      </div>

    </div>
  );
}
