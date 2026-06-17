'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, ArrowRight, CheckCircle2, 
  Clock, ShieldAlert, Award, ChevronRight, HelpCircle,
  FileText
} from 'lucide-react';
import Link from 'next/link';

export default function MegaQuizzesLanding() {
  const [activeTab, setActiveTab] = useState<'register' | 'status'>('register');
  
  // Public Config State
  const [config, setConfig] = useState({
    title: 'Xmarty Mega Live Quiz',
    description: 'Register for the upcoming premium live assessment tracks, track your enrollment verification, and start your test sessions securely.',
    bannerUrl: '',
    timeLimit: 10,
    questionCount: 5
  });

  // Registration Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regMessage, setRegMessage] = useState({ type: '', text: '' });

  // Status Form State
  const [statusEmail, setStatusEmail] = useState('');
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusResult, setStatusResult] = useState<any>(null);

  // Load config on mount
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/megaquizzes/config');
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        }
      } catch (err) {
        console.warn('Could not load dynamic quiz config, using default values.');
      }
    }
    loadConfig();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setRegMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/megaquizzes/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, number: phone })
      });
      const data = await res.json();
      if (res.ok) {
        setRegMessage({ type: 'success', text: 'Registration successful! The admin team will review your registration shortly.' });
        setName('');
        setEmail('');
        setPhone('');
      } else {
        setRegMessage({ type: 'error', text: data.error || 'Failed to submit registration.' });
      }
    } catch (err) {
      setRegMessage({ type: 'error', text: 'An unexpected connection error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCheckingStatus(true);
    setStatusResult(null);

    try {
      const res = await fetch('/api/megaquizzes/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: statusEmail })
      });
      const data = await res.json();
      setStatusResult(data);
    } catch (err) {
      setStatusResult({ error: 'Connection failed. Please try again.' });
    } finally {
      setIsCheckingStatus(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-[#04060E] text-slate-900 dark:text-white transition-colors duration-300 relative py-12 px-4 select-none overflow-hidden">
      {/* Animated network lines decoration */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      {/* Background glow filters */}
      <div className="absolute top-[10%] left-[10%] w-[350px] h-[350px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-10 relative z-10">
        
        {/* Dynamic Banner Header */}
        {config.bannerUrl ? (
          <div className="w-full h-48 sm:h-64 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/5 shadow-2xl relative mb-6">
            <img 
              src={config.bannerUrl} 
              alt="Mega Quiz Banner" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent flex flex-col justify-end p-6 sm:p-10 space-y-2">
              <div className="inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                <Award className="h-4 w-4" /> Live Assessment
              </div>
              <h1 className="text-2xl sm:text-4xl font-headline font-black text-white uppercase italic tracking-tight">
                {config.title}
              </h1>
            </div>
          </div>
        ) : (
          /* Fallback static visual header styling if no banner image URL provided */
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/25 text-xs font-bold uppercase tracking-wider">
              <Award className="h-4 w-4 text-primary" />
              <span>Mega Live Assessments</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-headline font-black tracking-tight text-slate-900 dark:text-white uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-500 to-rose-500">
              {config.title}
            </h1>
          </div>
        )}

        {/* Intro description */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
            {config.description}
          </p>
        </div>

        {/* Tab & Cards Container */}
        <div className="max-w-xl mx-auto bg-white/70 dark:bg-slate-950/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-200/80 dark:border-white/5 shadow-2xl p-6 sm:p-8 space-y-6">
          
          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl">
            <button
              onClick={() => { setActiveTab('register'); setRegMessage({ type: '', text: '' }); }}
              className={`h-11 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'register'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-slate-550 dark:text-slate-450 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              Register Now
            </button>
            <button
              onClick={() => { setActiveTab('status'); setStatusResult(null); }}
              className={`h-11 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'status'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-slate-550 dark:text-slate-450 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              Check Status
            </button>
          </div>

          <AnimatePresence mode="wait">
            
            {/* TAB 1: REGISTER */}
            {activeTab === 'register' && (
              <motion.div
                key="register"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {regMessage.text && (
                  <div className={`p-4 rounded-2xl text-xs font-semibold border flex items-start gap-2.5 ${
                    regMessage.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                  }`}>
                    {regMessage.type === 'success' ? <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5" /> : <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />}
                    <span>{regMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-450">
                        <User className="h-4.5 w-4.5" />
                      </div>
                      <input
                        required
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rahul Kumar"
                        className="w-full h-12 pl-11 pr-4 rounded-xl border outline-none text-sm border-slate-200 bg-white text-slate-950 focus:border-primary/60 dark:border-white/5 dark:bg-slate-900 dark:text-white dark:focus:border-primary/60"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-450">
                        <Mail className="h-4.5 w-4.5" />
                      </div>
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. rahul@example.com"
                        className="w-full h-12 pl-11 pr-4 rounded-xl border outline-none text-sm border-slate-200 bg-white text-slate-950 focus:border-primary/60 dark:border-white/5 dark:bg-slate-900 dark:text-white dark:focus:border-primary/60"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone Number</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-450">
                        <Phone className="h-4.5 w-4.5" />
                      </div>
                      <input
                        required
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +91 9876543210"
                        className="w-full h-12 pl-11 pr-4 rounded-xl border outline-none text-sm border-slate-200 bg-white text-slate-950 focus:border-primary/60 dark:border-white/5 dark:bg-slate-900 dark:text-white dark:focus:border-primary/60"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow shadow-primary/20"
                  >
                    {isSubmitting ? 'Submitting details...' : 'Submit Registration'}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </form>
              </motion.div>
            )}

            {/* TAB 2: CHECK STATUS */}
            {activeTab === 'status' && (
              <motion.div
                key="status"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <form onSubmit={handleCheckStatus} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Enter Registered Email</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-450">
                        <Mail className="h-4.5 w-4.5" />
                      </div>
                      <input
                        required
                        type="email"
                        value={statusEmail}
                        onChange={(e) => setStatusEmail(e.target.value)}
                        placeholder="e.g. rahul@example.com"
                        className="w-full h-12 pl-11 pr-4 rounded-xl border outline-none text-sm border-slate-200 bg-white text-slate-950 focus:border-primary/60 dark:border-white/5 dark:bg-slate-900 dark:text-white dark:focus:border-primary/60"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isCheckingStatus}
                    className="w-full h-12 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all"
                  >
                    {isCheckingStatus ? 'Checking logs...' : 'Check Status'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                {/* Status Result Display */}
                {statusResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 p-5 rounded-2xl border bg-slate-50/50 dark:bg-slate-950/20 border-slate-200 dark:border-white/5 text-center space-y-4"
                  >
                    {statusResult.error ? (
                      <p className="text-xs text-rose-500 font-semibold">{statusResult.error}</p>
                    ) : (
                      <>
                        <div className="flex items-center justify-center gap-2">
                          {statusResult.status === 'pending' && (
                            <div className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase">
                              Pending Review
                            </div>
                          )}
                          {statusResult.status === 'rejected' && (
                            <div className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-450 border border-rose-500/20 uppercase">
                              Rejected
                            </div>
                          )}
                          {statusResult.status === 'approved' && (
                            <div className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20 uppercase">
                              Approved
                            </div>
                          )}
                          {statusResult.status === 'not_found' && (
                            <div className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-white/10 text-slate-500 uppercase">
                              Not Registered
                            </div>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-slate-650 dark:text-slate-350 leading-relaxed">
                          {statusResult.message}
                        </p>

                        {statusResult.status === 'approved' && statusResult.token && (
                          <Link href={`/megaquizzes/test/${statusResult.token}`} className="inline-block w-full">
                            <button className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md">
                              Enter Quiz Arena
                            </button>
                          </Link>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Feature Highlights / Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-6 rounded-[2rem] bg-white/40 dark:bg-slate-950/20 border border-slate-200 dark:border-white/5 space-y-2">
            <Clock className="h-6 w-6 text-primary" />
            <h4 className="font-headline font-bold text-sm">{config.timeLimit}-Minute Assessment</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">Live countdown checks your response efficiency and technical accuracy under timed parameters.</p>
          </div>
          <div className="p-6 rounded-[2rem] bg-white/40 dark:bg-slate-950/20 border border-slate-200 dark:border-white/5 space-y-2">
            <HelpCircle className="h-6 w-6 text-indigo-500" />
            <h4 className="font-headline font-bold text-sm">{config.questionCount} Quiz Questions</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">Custom dynamic options randomized across domains testing comprehensive skillset validation.</p>
          </div>
          <div className="p-6 rounded-[2rem] bg-white/40 dark:bg-slate-950/20 border border-slate-200/5 bg-slate-950/20 space-y-2">
            <FileText className="h-6 w-6 text-emerald-500" />
            <h4 className="font-headline font-bold text-sm">Verified Credentials</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">Passed exam logs automatically sync with user profiles to generate verifiable credentials links.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
