import React from 'react';
import { getDb } from '@/lib/mongodb';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { generateFingerprint, verifySecureAccessToken } from '@/lib/secure-token';
import InteractiveMegaQuiz from './interactive-quiz';

type Props = {
  params: Promise<{ token: string }>;
};

export default async function MegaQuizTestPage({ params }: Props) {
  const { token } = await params;

  // 1. Get client headers for fingerprint generation
  const reqHeaders = await headers();
  const userAgent = reqHeaders.get('user-agent') || '';
  const ip = reqHeaders.get('x-forwarded-for') || '127.0.0.1';
  const fingerprint = generateFingerprint(userAgent, ip);

  // 2. Decode & Verify Secure Access Token
  const payload = await verifySecureAccessToken(token, fingerprint, { ip, userAgent });

  if (!payload || payload.courseId !== 'megaquiz' || payload.folderId !== 'test') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#04060E] flex items-center justify-center p-4 select-none">
        <Card className="max-w-md border-rose-500/30 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="h-16 w-16 mx-auto rounded-full bg-rose-500/10 flex items-center justify-center text-rose-550 border border-rose-500/20">
            <ShieldAlert className="h-8 w-8 animate-pulse" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl font-headline font-bold text-rose-550 dark:text-rose-400">Quiz Link Expired</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              This dynamic exam link is single-use and changes on every visit. It may have expired or been reused. Please return to the status page to generate a fresh dynamic token.
            </CardDescription>
          </div>
          <Button asChild className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold">
            <Link href="/megaquizzes">Go back</Link>
          </Button>
        </Card>
      </div>
    );
  }

  // 3. Find registration in MongoDB to ensure approval is active
  const db = await getDb();
  const registration = await db.collection('mega_quiz_registrations').findOne({ email: payload.email });

  if (!registration || registration.status !== 'approved') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#04060E] flex items-center justify-center p-4">
        <Card className="max-w-md border-amber-500/30 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="h-16 w-16 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl font-headline font-bold text-amber-500">Access Restricted</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              Your registration status is not approved. Please contact support or check status again.
            </CardDescription>
          </div>
          <Button asChild className="w-full bg-primary hover:bg-primary/95 text-white rounded-xl font-bold">
            <Link href="/megaquizzes">Go to Registration</Link>
          </Button>
        </Card>
      </div>
    );
  }

  // 4. Fetch dynamic Quiz questions configuration from db
  let quizConfig = await db.collection('mega_quizzes').findOne({ _id: 'active_mega_quiz' as any });
  if (!quizConfig) {
    quizConfig = await db.collection('mega_quizzes').findOne({});
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-[#04060E] text-slate-900 dark:text-white relative z-10 py-10 px-4">
      {/* Decorative background glows */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4">
          <div className="space-y-0.5">
            <span className="text-[10px] text-primary uppercase tracking-widest font-black">Dynamic Quiz Environment</span>
            <h1 className="text-xl font-headline font-black text-slate-900 dark:text-white uppercase italic">
              Mega Live Arena
            </h1>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex flex-col text-right text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <span>Student ID: {registration.name}</span>
              <span>IP Session: {ip}</span>
            </div>
            <Link href="/megaquizzes">
              <Button variant="outline" size="sm" className="rounded-xl border-slate-200 dark:border-white/10 text-xs font-bold gap-1">
                <ArrowLeft className="h-3.5 w-3.5" /> Quit
              </Button>
            </Link>
          </div>
        </div>

        {/* Client Interactive Quiz Component */}
        <InteractiveMegaQuiz 
          studentEmail={payload.email} 
          studentName={registration.name} 
          quizConfig={quizConfig ? JSON.parse(JSON.stringify(quizConfig)) : null}
        />

      </div>
    </div>
  );
}
