"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useUser } from "@/hooks/use-user";
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
  FileCheck2,
  AlertTriangle,
  Wifi,
  WifiOff,
  Bell,
  Code
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { offlineDb } from "@/lib/dexie";

function SecureWorkspaceContent() {
  const params = useParams();
  const sessionId = params.secureId as string;
  const router = useRouter();
  
  const { user, loading: userLoading } = useUser();
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

  // Connectivity and Sync states (Phase 3)
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "offline">("synced");
  const [syncError, setSyncError] = useState("");

  // Notification states (Phase 4)
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Sandbox states (Phase 9)
  const [codeOutput, setCodeOutput] = useState("");
  const [compiling, setCompiling] = useState(false);

  const timerRef = useRef<any>(null);

  // Sync state offline/online listeners
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      const handleOnline = () => {
        setIsOnline(true);
        triggerSyncEngine();
      };
      const handleOffline = () => {
        setIsOnline(false);
        setSyncStatus("offline");
      };
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  // Fetch secure test sequence
  useEffect(() => {
    if (user && sessionId) {
      const fetchSecureTest = async () => {
        try {
          const res = await fetch(`/api/tests/session/get?sessionId=${sessionId}`);
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed to load secure session");
          }
          const data = await res.json();
          if (data.completed) {
            setError("This exam session has already been completed.");
            setLoadingTest(false);
            return;
          }
          setTest(data.test);
          setTimeLeft(data.test.time_limit * 60);

          // Restore answers from IndexedDB if they exist (Phase 3 Offline Recovery)
          try {
            const saved = await offlineDb.localAnswers.get(sessionId);
            if (saved && saved.answers) {
              setAnswers(saved.answers);
            }
          } catch (dexieErr) {
            console.error("Dexie restore answers error:", dexieErr);
          }

          // Fetch notifications for the user
          loadNotifications();
        } catch (err: any) {
          setError(err.message || "Unable to fetch secure session details.");
        } finally {
          setLoadingTest(false);
        }
      };
      fetchSecureTest();
    }
  }, [user, sessionId]);

  // Handle countdown timer
  useEffect(() => {
    if (testStarted && timeLeft > 0 && !result) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            executeSubmit(true);
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

  // Auto-Save Answers to IndexedDB (Phase 3)
  const autoSaveToLocalDb = async (updatedAnswers: Record<string, any>) => {
    try {
      await offlineDb.localAnswers.put({
        sessionId,
        answers: updatedAnswers,
        lastSaved: new Date()
      });
      if (isOnline) {
        setSyncStatus("syncing");
        await syncAnswersToMongoDB(updatedAnswers);
      } else {
        setSyncStatus("offline");
      }
    } catch (e) {
      console.error("Local save error:", e);
    }
  };

  // Synchronize with MongoDB API
  const syncAnswersToMongoDB = async (currentAnswers: Record<string, any>) => {
    try {
      const res = await fetch("/api/tests/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, answers: currentAnswers })
      });
      if (res.ok) {
        setSyncStatus("synced");
      } else {
        setSyncStatus("offline");
      }
    } catch (e) {
      setSyncStatus("offline");
    }
  };

  const triggerSyncEngine = async () => {
    try {
      const local = await offlineDb.localAnswers.get(sessionId);
      if (local && local.answers) {
        setSyncStatus("syncing");
        await syncAnswersToMongoDB(local.answers);
        logProctorActivity("reconnect", { detail: "Internet recovered, state synced." });
      }
    } catch (e) {
      console.error("Sync engine failed:", e);
    }
  };

  // Proctor Logs activity logger (Phase 6 & 7)
  const logProctorActivity = async (activityType: string, metadata = {}) => {
    try {
      await fetch("/api/proctor/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId: test?.id || sessionId, activityType, metadata })
      });
    } catch (e) {
      console.warn("Proctor activity log upload failed", e);
    }
  };

  // Track page focus & blur (Proctoring events) and enforce exam security blockages (Phase 5)
  useEffect(() => {
    if (testStarted && !result) {
      const handleBlur = () => {
        logProctorActivity("tab_blur", { detail: "Student left secure browser focus." });
      };
      const handleFocus = () => {
        logProctorActivity("reconnect", { detail: "Student returned to secure focus." });
      };
      const preventCopyPaste = (e: Event) => {
        e.preventDefault();
        logProctorActivity("security_violation", { type: e.type, detail: `Prevented ${e.type} operation.` });
      };
      const handleKeyDown = (e: KeyboardEvent) => {
        // Prevent F12 and Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C / Ctrl+U (Devtools and source view)
        if (
          e.key === "F12" ||
          (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
          (e.ctrlKey && e.key === "u")
        ) {
          e.preventDefault();
          logProctorActivity("security_violation", { type: "devtools_attempt", detail: "Attempted to open DevTools." });
        }
      };

      window.addEventListener("blur", handleBlur);
      window.addEventListener("focus", handleFocus);
      document.addEventListener("copy", preventCopyPaste);
      document.addEventListener("paste", preventCopyPaste);
      document.addEventListener("contextmenu", preventCopyPaste);
      document.addEventListener("keydown", handleKeyDown);

      return () => {
        window.removeEventListener("blur", handleBlur);
        window.removeEventListener("focus", handleFocus);
        document.removeEventListener("copy", preventCopyPaste);
        document.removeEventListener("paste", preventCopyPaste);
        document.removeEventListener("contextmenu", preventCopyPaste);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [testStarted, result, test]);

  // Load User notifications
  const loadNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {}
  };

  const handleSelectAnswer = (qId: string, val: any) => {
    const nextAnswers = { ...answers, [qId]: val };
    setAnswers(nextAnswers);
    autoSaveToLocalDb(nextAnswers);
    logProctorActivity("answer_changed", { questionId: qId, value: String(val) });
  };

  const handleTriggerSubmit = () => {
    setShowSubmitModal(true);
  };

  const executeSubmit = async (auto = false) => {
    setSubmitting(true);
    setShowSubmitModal(false);
    logProctorActivity("submit", { autoSubmit: auto });
    
    try {
      const res = await fetch('/api/tests/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: test.id,
          answers,
          timeSpent,
          sessionId
        })
      });

      if (!res.ok) throw new Error("Failed to submit answers");
      const data = await res.json();
      setResult(data);

      // Clear local IndexedDB draft on success
      await offlineDb.localAnswers.delete(sessionId);
    } catch (err: any) {
      alert("Submission error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Coding Sandbox execution sandbox runner (Phase 9 CE Judge0 integration)
  const handleRunCode = async (qId: string, language: string) => {
    const code = answers[qId] || "";
    if (!code.trim()) {
      setCodeOutput("No code provided to compile.");
      return;
    }
    setCompiling(true);
    setCodeOutput("Compiling and executing on Judge0 Sandbox CE environment...");
    
    try {
      const res = await fetch("/api/sandbox/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language })
      });
      const data = await res.json();
      if (data.error) {
        setCodeOutput(`Compile Error:\n${data.error}`);
      } else {
        setCodeOutput(`Execution Success (Exit code: 0):\n\nOutput:\n${data.stdout || "No standard output returned."}`);
      }
    } catch (e) {
      setCodeOutput("Execution failed. Sandbox endpoint unreachable.");
    } finally {
      setCompiling(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

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
            <p className="text-xs text-slate-400">Verifying authorization parameters & fetching question sequences...</p>
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
    );
  }

  if (error || !test) {
    return (
      <div className="w-full h-screen flex items-center justify-center p-4 bg-slate-950 text-white">
        <div className="text-center space-y-4 max-w-sm w-full bg-slate-900 p-8 rounded-[2rem] border border-white/10 shadow-xl">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold">Session Configuration Error</h2>
          <p className="text-xs text-slate-400">{error || "No secure exam session found or session is not active."}</p>
          <Link href="/profile" className="inline-block w-full">
            <button className="w-full h-11 rounded-xl bg-white/10 text-foreground font-bold transition-all duration-200">
              Return to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Summary Welcome Start Panel
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
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Enterprise Exam Session</p>
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
                <p className="font-bold text-amber-500">Security Warning:</p>
                <p className="text-slate-400 leading-relaxed">
                  This test is locked to this URL session ID. Your order of questions is frozen. Navigating away, opening new tabs, or exiting focus triggers proctoring logs.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setTestStarted(true);
                logProctorActivity("reconnect", { detail: "Exam session started." });
              }}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-base shadow-xl shadow-primary/20 hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
            >
              Start Secure Exam
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Result Display
  if (result) {
    return (
      <div className="w-full h-screen overflow-y-auto bg-slate-950 text-white flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-3xl w-full space-y-6 my-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-6 text-center"
          >
            {result.passed ? (
              <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto animate-bounce" />
            ) : (
              <XCircle className="h-16 w-16 text-rose-500 mx-auto" />
            )}
            <h1 className="text-2xl font-headline font-black text-white">
              {result.passed ? "Exam Passed!" : "Exam Failed"}
            </h1>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">{test.title}</p>

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
                  <ArrowLeft className="mr-1 h-4 w-4" /> Return to Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
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
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="flex-1 min-h-0 flex flex-col space-y-4 relative z-10 max-w-5xl mx-auto w-full">
        
        {/* Top Header */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
              <Lock className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] tracking-widest font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">Secure Exam Workspace</span>
                
                {/* Sync status indicators (Phase 3) */}
                <span className={`flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full uppercase font-extrabold border ${
                  syncStatus === 'synced'
                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                    : syncStatus === 'syncing'
                    ? 'border-amber-500/20 bg-amber-500/10 text-amber-400 animate-pulse'
                    : 'border-rose-500/20 bg-rose-500/10 text-rose-400'
                }`}>
                  {syncStatus === 'synced' ? (
                    <><Wifi className="h-2.5 w-2.5" /> Answers Synced</>
                  ) : syncStatus === 'syncing' ? (
                    <><Wifi className="h-2.5 w-2.5 animate-spin" /> Saving...</>
                  ) : (
                    <><WifiOff className="h-2.5 w-2.5" /> Offline Mode Active</>
                  )}
                </span>
              </div>
              <h2 className="text-sm font-extrabold text-white mt-0.5 truncate">{test.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* Notification drop-down toggle (Phase 4) */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="h-9 w-9 rounded-xl border border-white/5 bg-slate-950/40 hover:bg-slate-800 text-slate-300 flex items-center justify-center transition-colors relative"
              >
                <Bell className="h-4 w-4" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-500 text-[8px] font-black rounded-full flex items-center justify-center text-white">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-4 space-y-3 z-50 text-left">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Slack Notifications</h4>
                    <div className="divide-y divide-white/5 max-h-48 overflow-y-auto space-y-2 pr-1">
                      {notifications.length === 0 ? (
                        <p className="text-[10px] text-slate-500 py-3 text-center">No new notifications.</p>
                      ) : (
                        notifications.map((n, i) => (
                          <div key={i} className="pt-2 text-[10px] text-slate-300 leading-snug space-y-1">
                            <p className="font-bold text-white">{n.title}</p>
                            <p className="text-slate-400">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-col text-right">
              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Sheet Progress</span>
              <span className="text-xs font-black text-white">{answeredCount} of {totalQuestions} Answered</span>
            </div>
            <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden shrink-0">
              <div className="bg-gradient-to-r from-primary to-accent h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

        {/* Main Grid Content */}
        <div className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-[280px_1fr] gap-4 lg:gap-6 items-stretch">
          
          {/* Navigation Matrix Sidebar */}
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
          </div>

          {/* Central Question Panel */}
          <div className="max-h-full min-h-0 flex flex-col">
            {activeQuestion && (
              <motion.div
                key={activeQuestion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col h-full bg-slate-900/30 border border-white/5 backdrop-blur-xl p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl min-h-0 overflow-hidden"
              >
                {/* Question Info Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3 shrink-0">
                  <span className="text-xs font-bold text-slate-400">Question {activeIndex + 1} of {totalQuestions}</span>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-0.5 rounded-full uppercase tracking-wider">{activeQuestion.marks} marks</span>
                </div>

                {/* Question Text */}
                <h2 className="text-sm sm:text-base font-headline font-bold text-white leading-relaxed py-3 shrink-0">{activeQuestion.text}</h2>

                {/* Question Type Answers Panels */}
                <div className="flex-1 overflow-y-auto min-h-0 py-2 space-y-4 pr-2 scrollbar-thin">
                  
                  {/* MCQ type */}
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

                  {/* True/False type */}
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

                  {/* Short text / subjective type */}
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

                  {/* Programming Code sandbox (Phase 9 Coding Sandbox CE Judge0 CE compilation) */}
                  {activeQuestion.type === 'coding' && (
                    <div className="space-y-3">
                      <div className="border border-white/10 rounded-2xl overflow-hidden bg-slate-950 p-2">
                        <textarea
                          rows={8}
                          value={answers[activeQuestion.id] || ""}
                          onChange={e => handleSelectAnswer(activeQuestion.id, e.target.value)}
                          placeholder="// Type your execution logic code here..."
                          className="w-full p-3 bg-transparent text-xs font-mono text-emerald-400 outline-none resize-y"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-mono">Sandbox: Python 3, JS Node, or C++</span>
                        <Button 
                          onClick={() => handleRunCode(activeQuestion.id, activeQuestion.language || 'javascript')}
                          disabled={compiling}
                          className="h-9 rounded-xl bg-primary text-primary-foreground font-bold text-xs"
                        >
                          <Code className="h-3.5 w-3.5 mr-1" />
                          {compiling ? "Running..." : "Run Sandbox Code"}
                        </Button>
                      </div>

                      {codeOutput && (
                        <pre className="p-3 bg-slate-950 border border-white/5 rounded-xl font-mono text-[10px] text-slate-300 overflow-x-auto leading-relaxed">
                          {codeOutput}
                        </pre>
                      )}
                    </div>
                  )}

                </div>

                {/* Question Panel Controllers */}
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

      {/* Confirmation Modal */}
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
                <h3 className="text-base font-bold text-white">Submit Sheet?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Are you sure you want to submit? You cannot return to review or change answers once submitted.
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
                  onClick={() => executeSubmit(false)}
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

export default function SecureExamSessionPage() {
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
            <p className="text-xs text-slate-400">Verifying authorization parameters & fetching question sequences...</p>
          </div>
        </div>
      </div>
    }>
      <SecureWorkspaceContent />
    </Suspense>
  );
}
