'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, CheckCircle, AlertTriangle, ChevronRight, 
  HelpCircle, Sparkles, RefreshCw, Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  studentEmail: string;
  studentName: string;
  quizConfig?: any;
};

// Default MCQs fallback
const DEFAULT_QUESTIONS = [
  {
    id: 'q1',
    question: "Which of the following is correct about React Server Components (RSC)?",
    options: [
      "They are executed on the client side during render hooks",
      "They render exclusively on the server and reduce client bundle size",
      "They replace client-side state managers like Redux or Zustand",
      "They require the 'use client' directive at the top of the file"
    ],
    answerIndex: 1
  },
  {
    id: 'q2',
    question: "What is the primary mechanism of Next.js Turbopack?",
    options: [
      "An incremental bundler written in Rust for high-speed dev builds",
      "A database indexing driver for serverless PostgreSQL clusters",
      "An edge runtime execution compiler for global geolocation routing",
      "A CSS-in-JS compilation tool optimized for style sheets loads"
    ],
    answerIndex: 0
  },
  {
    id: 'q3',
    question: "In MongoDB, what does a database index optimize?",
    options: [
      "The connection speed between Atlas and application hosts",
      "The layout storage compression ratio of JSON document fields",
      "Query execution speed by avoiding full collection scans",
      "The replica pool synchronization frequency across zones"
    ],
    answerIndex: 2
  },
  {
    id: 'q4',
    question: "Which HTTP status code represents 'Too Many Requests' for API rate-limiting?",
    options: [
      "403 Forbidden",
      "429 Too Many Requests",
      "401 Unauthorized",
      "404 Not Found"
    ],
    answerIndex: 1
  },
  {
    id: 'q5',
    question: "Which of the following describes a 'Replay Attack' in authentication?",
    options: [
      "Maliciously recording and repeating a valid data transmission to gain access",
      "Injecting dynamic JavaScript scripts into input form text fields",
      "Flooding server ports with duplicate TCP handshakes to trigger a freeze",
      "Modifying local storage cookies to bypass user verification checks"
    ],
    answerIndex: 0
  }
];

export default function InteractiveMegaQuiz({ studentEmail, studentName, quizConfig }: Props) {
  // Resolve quiz configuration dynamically
  const quizQuestions = quizConfig?.questions && Array.isArray(quizConfig.questions) && quizConfig.questions.length > 0
    ? quizConfig.questions
    : DEFAULT_QUESTIONS;

  const resolvedTimeLimit = quizConfig?.timeLimit ? Number(quizConfig.timeLimit) * 60 : 600; // time in seconds

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(resolvedTimeLimit);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scoreData, setScoreData] = useState<any>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit(true); // Auto-submit when time is up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleSelectOption = (qId: string, optionIdx: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: optionIdx
    }));
  };

  const handleSubmit = async (isAuto = false) => {
    if (isFinished) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setIsSubmitting(true);

    // Calculate score
    let correctCount = 0;
    quizQuestions.forEach((q: any) => {
      if (selectedAnswers[q.id] === q.answerIndex) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / quizQuestions.length) * 100);

    try {
      const res = await fetch('/api/megaquizzes/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: studentEmail,
          name: studentName,
          score: finalScore,
          correctAnswers: correctCount,
          totalQuestions: quizQuestions.length,
          timeSpent: resolvedTimeLimit - timeLeft,
          autoSubmitted: isAuto
        })
      });

      if (res.ok) {
        setScoreData({
          score: finalScore,
          correct: correctCount,
          total: quizQuestions.length,
          percentage: finalScore
        });
        setIsFinished(true);
      } else {
        alert('Failed to save your test attempt. Please check your connection.');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting test results.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  if (isFinished && scoreData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 sm:p-10 rounded-[2.5rem] bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 shadow-2xl text-center space-y-6"
      >
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/25 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-lg">
            <Trophy className="h-10 w-10 text-emerald-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-headline font-black text-slate-900 dark:text-white uppercase italic">
            Assessment Complete!
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold max-w-sm mx-auto">
            Congratulations {studentName}! Your response logs have been securely submitted and saved to the admin registry.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Score</span>
            <span className="text-xl font-headline font-black text-indigo-500">{scoreData.percentage}%</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Correct</span>
            <span className="text-xl font-headline font-black text-emerald-500">{scoreData.correct}/{scoreData.total}</span>
          </div>
        </div>

        <div className="pt-4">
          <a href="/megaquizzes" className="inline-block">
            <Button className="bg-primary hover:bg-primary/95 text-white font-bold rounded-xl px-6">
              Return to Landing
            </Button>
          </a>
        </div>
      </motion.div>
    );
  }

  const currentQuestion = quizQuestions[currentIdx];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Question Pane (Left/Center columns) */}
      <div className="md:col-span-2 space-y-6">
        <div className="p-6 sm:p-8 rounded-[2.5rem] bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 shadow-lg space-y-6">
          
          {/* Question Index Progress */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Question {currentIdx + 1} of {quizQuestions.length}</span>
            <span className="text-primary font-mono">{timeLeft <= 120 ? '⚠️ ' : ''}{formatTime(timeLeft)}</span>
          </div>

          <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / quizQuestions.length) * 100}%` }}
            />
          </div>

          {/* Question Title */}
          <h3 className="text-base sm:text-lg font-headline font-bold text-slate-900 dark:text-white leading-snug">
            {currentQuestion.question}
          </h3>

          {/* Options List */}
          <div className="space-y-3">
            {currentQuestion.options.map((option: string, idx: number) => {
              const isSelected = selectedAnswers[currentQuestion.id] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(currentQuestion.id, idx)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all text-xs font-semibold flex items-center justify-between ${
                    isSelected
                      ? 'bg-primary/10 border-primary text-primary font-black shadow-inner'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 dark:bg-white/5 dark:hover:bg-white/[0.02] dark:border-white/5 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{option}</span>
                  <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-primary bg-primary text-white' : 'border-slate-300 dark:border-white/10'
                  }`}>
                    {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-4">
          <Button
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(prev => prev - 1)}
            variant="outline"
            className="rounded-xl border-slate-200 dark:border-white/10 font-bold"
          >
            Previous
          </Button>

          {currentIdx === quizQuestions.length - 1 ? (
            <Button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/95 text-white font-bold rounded-xl px-6 shadow"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentIdx(prev => prev + 1)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-6 gap-1"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Overview/Time Status Column (Right column) */}
      <div className="space-y-6">
        {/* Timer Box */}
        <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 shadow-md flex flex-col items-center text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Clock className="h-6 w-6 animate-pulse" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Timer Remaining</span>
            <h2 className="text-3xl font-headline font-black text-slate-900 dark:text-white font-mono">
              {formatTime(timeLeft)}
            </h2>
          </div>
        </div>

        {/* Navigation Grid overview */}
        <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 shadow-md space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Question Grid</h4>
          <div className="grid grid-cols-5 gap-2.5">
            {quizQuestions.map((q: any, idx: number) => {
              const isAnswered = selectedAnswers[q.id] !== undefined;
              const isCurrent = idx === currentIdx;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`h-9 rounded-xl text-xs font-black flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'bg-primary text-white border border-primary/20 scale-110 shadow-md'
                      : isAnswered
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
