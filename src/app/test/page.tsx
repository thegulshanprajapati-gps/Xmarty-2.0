'use client';

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useUser } from "@/hooks/use-user";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Timer,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  ArrowLeft,
  LayoutDashboard,
  Shield,
  Lock,
  Clock,
  Compass,
  FileCheck2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function TestTakerContent() {
  const { user, loading: userLoading } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const testId = searchParams.get('id');

  const [test, setTest] = useState<any>(null);
  const [loadingTest, setLoadingTest] = useState(true);
  const [error, setError] = useState("");

  const [testStarted, setTestStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const timerRef = useRef<any>(null);

  // Fetch test details with minimum 1-second loader delay
  useEffect(() => {
    if (user && testId) {
      const startTime = Date.now();
      const fetchTest = async () => {
        try {
          const res = await fetch(`/api/tests/get?id=${testId}`);
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed to load test");
          }
          const data = await res.json();
          setTest(data.test);
          setTimeLeft(data.test.time_limit * 60);
        } catch (err: any) {
          setError(err.message || "Unable to fetch test details.");
        } finally {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, 1000 - elapsed);
          setTimeout(() => {
            setLoadingTest(false);
          }, remaining);
        }
      };
      fetchTest();
    } else if (!testId) {
      setLoadingTest(false);
    }
  }, [user, testId]);

  // Handle countdown timer
  useEffect(() => {
    if (testStarted && timeLeft > 0 && !result) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            executeSubmit(true); // Auto submit on timeout
            return 0;
          }
          return prev - 1;
        });
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testStarted, timeLeft, result]);

  const handleSelectAnswer = (qId: string, val: any) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: val
    }));
  };

  const handleTriggerSubmit = () => {
    setShowSubmitModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowSubmitModal(false);
    await executeSubmit(false);
  };

  const executeSubmit = async (autoSubmit = false) => {
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const res = await fetch('/api/tests/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId,
          answers,
          timeSpent
        })
      });

      if (!res.ok) {
        throw new Error("Failed to submit answers");
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      alert("Submission error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  // Custom 1-second Workspace Loader (Dynamic branding colors)
  if (userLoading || loadingTest) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-200 p-6">
        <div className="max-w-md w-full text-center space-y-6 px-6">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/10 animate-pulse" />
            <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-headline font-bold text-lg text-white">Configuring Secure Workspace</h3>
            <p className="text-xs text-slate-400">Verifying authorization parameters & fetching questions keys...</p>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-primary to-accent" 
            />
          </div>
          {/* Social links on loading window */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/5">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1.5 text-xs font-semibold">
              <i className="fa-brands fa-instagram text-lg"></i> Instagram
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1.5 text-xs font-semibold">
              <i className="fa-brands fa-youtube text-lg"></i> YouTube
            </a>
            <a href="https://wa.me" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-500 transition-colors flex items-center gap-1.5 text-xs font-semibold">
              <i className="fa-brands fa-whatsapp text-lg"></i> WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full h-screen flex items-center justify-center p-4 bg-slate-950 text-white">
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center space-y-4 max-w-sm w-full bg-slate-900 p-8 rounded-[2rem] border border-white/10 shadow-xl"
        >
          <div className="text-3xl text-primary">
            <i className="fa-solid fa-circle-exclamation"></i>
          </div>
          <h2 className="text-lg font-headline font-bold">Sign in to continue</h2>
          <p className="text-xs text-slate-400">You must be logged in to access test details.</p>
          <Link href="/login" className="inline-block w-full">
            <button className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold transition-all duration-200 shadow-md">
              Sign In
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!testId || error || !test) {
    return (
      <div className="w-full h-screen flex items-center justify-center p-4 bg-slate-950 text-white">
        <div className="text-center space-y-4 max-w-sm w-full bg-slate-900 p-8 rounded-[2rem] border border-white/10 shadow-xl">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold">Invalid Test Access</h2>
          <p className="text-xs text-slate-400">{error || "No test ID specified or test could not be found."}</p>
          <Link href="/profile" className="inline-block w-full">
            <button className="w-full h-11 rounded-xl bg-white/10 text-foreground font-bold transition-all duration-200">
              Return to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // View: Test Summary / Start Panel
  if (!testStarted) {
    return (
      <div className="w-full h-screen overflow-y-auto bg-slate-950 text-white flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-6"
          >
            <div className="flex items-center gap-3 border-b pb-4 border-white/5">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-headline font-bold">{test.title}</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Skill Assessment Info</p>
              </div>
            </div>

            {test.description && (
              <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-4 rounded-xl">{test.description}</p>
            )}

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="border border-white/5 p-3 rounded-2xl bg-slate-950/20">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Time Limit</p>
                <p className="text-sm font-black text-primary mt-0.5">{test.time_limit} mins</p>
              </div>
              <div className="border border-white/5 p-3 rounded-2xl bg-slate-950/20">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Questions</p>
                <p className="text-sm font-black text-primary mt-0.5">{test.questions?.length || 0}</p>
              </div>
              <div className="border border-white/5 p-3 rounded-2xl bg-slate-950/20">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Pass Mark</p>
                <p className="text-sm font-black text-primary mt-0.5">{test.pass_marks}%</p>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.03] p-4 flex gap-2.5 items-start">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-amber-500">Important Instructions:</p>
                <p className="text-slate-400 leading-relaxed">
                  Once initialized, the countdown timer starts and cannot be paused. Refreshing the browser or leaving the page will auto-submit unanswered questions.
                </p>
              </div>
            </div>

            <button
              onClick={() => setTestStarted(true)}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-base shadow-xl shadow-primary/20 hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
            >
              Start Skill Check
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // View: Test Result Display
  if (result) {
    return (
      <div className="w-full h-screen overflow-y-auto bg-slate-950 text-white flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-3xl w-full space-y-6 my-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-6"
          >
            <div className="text-center space-y-4">
              {result.passed ? (
                <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto animate-bounce" />
              ) : (
                <XCircle className="h-16 w-16 text-rose-500 mx-auto" />
              )}
              <h1 className="text-2xl font-headline font-black">
                {result.passed ? "Assessment Passed!" : "Assessment Failed"}
              </h1>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">{test.title}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="border border-white/5 p-4 rounded-2xl bg-slate-950/20">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Your Score</p>
                <p className="text-lg font-black text-white mt-0.5">{result.score} / {result.total_marks}</p>
              </div>
              <div className="border border-white/5 p-4 rounded-2xl bg-slate-950/20">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Percentage</p>
                <p className="text-lg font-black text-white mt-0.5">{result.percentage}%</p>
              </div>
              <div className="border border-white/5 p-4 rounded-2xl bg-slate-950/20">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Required Pass</p>
                <p className="text-lg font-black text-white mt-0.5">{test.pass_marks}%</p>
              </div>
              <div className="border border-white/5 p-4 rounded-2xl bg-slate-950/20">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Time Elapsed</p>
                <p className="text-lg font-black text-white mt-0.5">{formatTime(timeSpent)}</p>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-white/5">
              <Link href="/profile" className="flex-1">
                <Button className="w-full h-12 rounded-xl font-bold text-xs" variant="outline">
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button className="w-full h-12 rounded-xl font-bold text-xs bg-primary text-primary-foreground hover:opacity-90">
                  <LayoutDashboard className="mr-1 h-4 w-4" /> Home Console
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Detailed Question Review */}
          <div className="space-y-4">
            <h2 className="text-base font-bold uppercase tracking-wider text-slate-400 pl-2">Questions Review Sheet</h2>
            {result.questions?.map((q: any, i: number) => {
              const studentAns = answers[q.id];
              let isCorrect = false;

              if (q.type === 'mcq') {
                isCorrect = String(studentAns).trim() === String(q.correctOptionId).trim();
              } else if (q.type === 'true_false') {
                isCorrect = Boolean(studentAns) === Boolean(q.correctBool);
              } else if (q.type === 'one_word') {
                isCorrect = String(studentAns).trim().toLowerCase() === String(q.correctWord).trim().toLowerCase();
              }

              return (
                <div key={q.id} className="bg-slate-900 p-6 rounded-2xl border border-white/5 shadow-md space-y-4">
                  <div className="flex items-center justify-between border-b pb-2 border-white/5">
                    <span className="text-xs font-bold text-slate-400">Question {i + 1} ({q.marks} {q.marks === 1 ? 'mark' : 'marks'})</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      isCorrect ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-white">{q.text}</p>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5">
                      <span className="font-bold text-slate-400 block mb-1">Your Answer:</span>
                      <span className="font-semibold text-white">{studentAns === undefined ? "Unanswered" : String(studentAns)}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/20">
                      <span className="font-bold text-emerald-400 block mb-1">Correct Answer:</span>
                      <span className="font-semibold text-emerald-400">
                        {q.type === 'mcq'
                          ? q.options?.find((o: any) => o.id === q.correctOptionId)?.text || q.correctOptionId
                          : q.type === 'true_false'
                          ? String(q.correctBool).toUpperCase()
                          : q.correctWord
                        }
                      </span>
                    </div>

                    {q.explanation && (
                      <div className="p-3 rounded-xl bg-indigo-500/[0.03] border border-indigo-500/20">
                        <span className="font-bold text-indigo-400 block mb-1">Explanation:</span>
                        <p className="text-slate-400 leading-relaxed">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const activeQuestion = test.questions?.[activeIndex];
  const totalQuestions = test.questions?.length || 0;
  const answeredCount = Object.keys(answers).filter(k => answers[k] !== undefined && answers[k] !== "").length;
  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col bg-slate-950 text-white p-4 sm:p-6 relative font-sans">
      {/* Background Decorative Neon Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Workspace (Strictly fits on screen) */}
      <div className="flex-1 min-h-0 flex flex-col space-y-4 relative z-10 max-w-5xl mx-auto w-full">
        
        {/* Secure Test Top Bar Header (shrink-0) */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
              <Lock className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] tracking-widest font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">Secure Exam Mode</span>
                <span className="text-xs text-slate-500 font-mono truncate">ID: {test.id}</span>
              </div>
              <h2 className="text-sm font-extrabold text-white mt-0.5 truncate">{test.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="flex flex-col text-right">
              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Sheet Progress</span>
              <span className="text-xs font-black text-white">{answeredCount} of {totalQuestions} Answered</span>
            </div>
            <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden shrink-0">
              <div className="bg-gradient-to-r from-primary to-accent h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

        {/* Main Grid Content (flexible, min-h-0 for absolute viewport containment) */}
        <div className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-[280px_1fr] gap-4 lg:gap-6 items-stretch">
          
          {/* Navigation & Stats Sidebar */}
          <div className="flex flex-col gap-3 lg:gap-4 shrink-0 lg:max-h-full lg:min-h-0">
            <Card className="rounded-2xl lg:rounded-3xl border border-white/5 bg-slate-900/40 backdrop-blur-xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row lg:flex-col justify-between gap-3 lg:gap-4 min-h-0 shrink-0 lg:max-h-full">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 sm:pb-0 lg:pb-3 shrink-0 sm:border-b-0 lg:border-b">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Time Left</span>
                </div>
                <div className={`flex items-center gap-1 font-mono text-xs sm:text-sm font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl transition-all ${
                  timeLeft < 120 
                    ? 'text-rose-500 bg-rose-500/10 animate-pulse' 
                    : 'text-primary bg-primary/5'
                }`}>
                  <Timer className="h-3.5 w-3.5" />
                  <span>{formatTime(timeLeft)}</span>
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2 flex-1 min-h-0 flex flex-col">
                <span className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest block shrink-0">Questions</span>
                <div className="overflow-x-auto lg:overflow-y-auto pr-1 pb-1 scrollbar-thin max-w-full">
                  <div className="flex lg:grid lg:grid-cols-5 gap-1.5">
                    {test.questions?.map((q: any, idx: number) => {
                      const isAnswered = answers[q.id] !== undefined && answers[q.id] !== "";
                      const isActive = activeIndex === idx;

                      return (
                        <button
                          key={q.id}
                          onClick={() => setActiveIndex(idx)}
                          className={`h-8 w-8 lg:h-9 lg:w-9 rounded-lg lg:rounded-xl font-bold text-xs flex items-center justify-center border shrink-0 transition-all ${
                            isActive
                              ? 'bg-gradient-to-br from-primary to-accent border-transparent text-primary-foreground scale-105 shadow-md shadow-primary/20'
                              : isAnswered
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'bg-slate-900/50 border-white/5 text-slate-400 hover:border-white/20'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                onClick={handleTriggerSubmit}
                disabled={submitting}
                className="w-full sm:w-auto lg:w-full h-10 lg:h-11 px-4 sm:px-6 lg:px-4 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/10 hover:scale-[1.01] transition-all shrink-0"
              >
                <Send className="h-3.5 w-3.5" /> Submit Sheet
              </button>
            </Card>

            <div className="hidden lg:flex bg-slate-900/20 border border-white/5 rounded-3xl p-3.5 gap-2.5 items-start text-[11px] text-slate-400 shrink-0">
              <Compass className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5 animate-spin-slow" />
              <div className="space-y-0.5 leading-normal">
                <p className="font-bold text-white">Browser Protection</p>
                <p>Leaving this tab will force auto-submission of answers.</p>
              </div>
            </div>
          </div>

          {/* Central Question Panel */}
          <div className="max-h-full min-h-0 flex flex-col">
            {activeQuestion && (
              <motion.div
                key={activeQuestion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col h-full bg-slate-900/30 border border-white/5 backdrop-blur-xl p-6 sm:p-8 rounded-[2.5rem] shadow-xl min-h-0 overflow-hidden"
              >
                {/* Header (shrink-0) */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3 shrink-0">
                  <span className="text-xs font-bold text-slate-400">Question {activeIndex + 1} of {totalQuestions}</span>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-0.5 rounded-full uppercase tracking-wider">{activeQuestion.marks} marks</span>
                </div>

                {/* Question Text (shrink-0) */}
                <h2 className="text-sm sm:text-base font-headline font-bold text-white leading-relaxed py-3 shrink-0">{activeQuestion.text}</h2>

                {/* Answers Fields Options (Scrollable area, flex-1, min-h-0) */}
                <div className="flex-1 overflow-y-auto min-h-0 py-2 space-y-3 pr-2 scrollbar-thin">
                  {activeQuestion.type === 'mcq' && (
                    <div className="space-y-2.5">
                      {activeQuestion.options?.map((opt: any, oi: number) => {
                        const isSelected = answers[activeQuestion.id] === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleSelectAnswer(activeQuestion.id, opt.id)}
                            className={`w-full p-3.5 rounded-xl border text-left font-bold text-xs sm:text-sm flex items-center gap-3 transition-all ${
                              isSelected
                                ? 'bg-primary/10 border-primary text-primary-foreground'
                                : 'border-white/5 bg-slate-900/20 hover:bg-slate-900/40 text-slate-300'
                            }`}
                          >
                            <span className={`w-5.5 h-5.5 rounded-lg border flex items-center justify-center shrink-0 text-[10px] font-extrabold ${
                              isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-slate-700 bg-slate-950/40'
                            }`}>
                              {String.fromCharCode(65 + oi)}
                            </span>
                            <span>{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {activeQuestion.type === 'true_false' && (
                    <div className="flex gap-4">
                      {[true, false].map(val => {
                        const isSelected = answers[activeQuestion.id] === val;
                        return (
                          <button
                            key={String(val)}
                            onClick={() => handleSelectAnswer(activeQuestion.id, val)}
                            className={`flex-1 py-4 rounded-xl border font-bold text-xs transition-all ${
                              isSelected
                                ? val
                                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-md shadow-emerald-500/5'
                                  : 'border-rose-500 bg-rose-500/10 text-rose-400 shadow-md shadow-rose-500/5'
                                : 'border-white/5 bg-slate-900/20 hover:border-slate-700 text-slate-400'
                            }`}
                          >
                            {val ? 'TRUE' : 'FALSE'}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {activeQuestion.type === 'one_word' && (
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={answers[activeQuestion.id] || ""}
                        onChange={e => handleSelectAnswer(activeQuestion.id, e.target.value)}
                        placeholder="Type your one-word answer here..."
                        className="w-full h-11 px-4 rounded-xl border outline-none text-xs transition-all border-white/5 bg-slate-950/40 text-white focus:border-primary"
                      />
                    </div>
                  )}
                </div>

                {/* Back / Next Controllers (shrink-0) */}
                <div className="flex items-center justify-between pt-3 mt-auto border-t border-white/5 shrink-0">
                  <Button
                    disabled={activeIndex === 0}
                    onClick={() => setActiveIndex(activeIndex - 1)}
                    variant="ghost"
                    className="rounded-xl h-9 text-xs font-bold gap-1 text-slate-400 hover:text-white hover:bg-white/5"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>

                  <Button
                    disabled={activeIndex === totalQuestions - 1}
                    onClick={() => setActiveIndex(activeIndex + 1)}
                    variant="ghost"
                    className="rounded-xl h-9 text-xs font-bold gap-1 text-slate-400 hover:text-white hover:bg-white/5"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Premium In-built Confirmation Modal Popup */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-slate-900 border border-white/10 max-w-sm w-full rounded-3xl p-6 shadow-2xl space-y-5"
            >
              <div className="text-center space-y-2">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto text-xl">
                  <FileCheck2 className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white">Submit Exam Sheet?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Are you sure you want to submit your test? You will not be able to review or modify your answers after final submission.
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-xl h-11 font-bold text-xs border-white/10 hover:bg-white/5 text-slate-300"
                  onClick={() => setShowSubmitModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 rounded-xl h-11 font-bold text-xs bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20"
                  onClick={handleConfirmSubmit}
                >
                  Yes, Submit
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TestTakerPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-200">
        <div className="max-w-md w-full text-center space-y-6 px-6">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/10 animate-pulse" />
            <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-headline font-bold text-lg text-white">Configuring Secure Workspace</h3>
            <p className="text-xs text-slate-400">Verifying authorization parameters & fetching questions keys...</p>
          </div>
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/5">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1.5 text-xs font-semibold">
              <i className="fa-brands fa-instagram text-lg"></i> Instagram
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1.5 text-xs font-semibold">
              <i className="fa-brands fa-youtube text-lg"></i> YouTube
            </a>
            <a href="https://wa.me" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-500 transition-colors flex items-center gap-1.5 text-xs font-semibold">
              <i className="fa-brands fa-whatsapp text-lg"></i> WhatsApp
            </a>
          </div>
        </div>
      </div>
    }>
      <TestTakerContent />
    </Suspense>
  );
}
