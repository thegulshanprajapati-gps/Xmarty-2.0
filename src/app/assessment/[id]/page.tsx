
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Timer, Trophy, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

const QUESTIONS = [
  {
    id: 1,
    question: "What is the primary benefit of using JWT for authentication?",
    options: [
      "It stores session state on the server",
      "It is stateless and enables horizontal scalability",
      "It is only usable with MongoDB",
      "It requires a persistent database connection"
    ],
    answer: 1
  },
  {
    id: 2,
    question: "Which hook is used for client-side side effects in Next.js?",
    options: ["useServer", "useState", "useEffect", "useStatic"],
    answer: 2
  },
  {
    id: 3,
    question: "What does ShadCN provide?",
    options: [
      "A JavaScript library for data visualization",
      "A collection of re-usable components built with Radix UI and Tailwind CSS",
      "A cloud-based hosting platform",
      "A new database management system"
    ],
    answer: 1
  }
];

export default function AssessmentPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isFinished, setIsFinished] = useState(false);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsFinished(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleNext = () => {
    if (selected === QUESTIONS[currentIdx].answer) {
      setScore(prev => prev + 1);
    }
    
    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelected(null);
    } else {
      setIsFinished(true);
    }
  };

  const currentQ = QUESTIONS[currentIdx];
  const progress = ((currentIdx + 1) / QUESTIONS.length) * 100;

  if (isFinished) {
    return (
      <div className="bg-muted/30 py-16">
        <main className="max-w-3xl mx-auto px-4 py-16">
          <Card className="text-center p-12 border-primary/20 shadow-2xl animate-fade-in">
            <Trophy className="h-24 w-24 text-accent mx-auto mb-6" />
            <h1 className="text-4xl font-headline font-bold mb-4">Assessment Complete!</h1>
            <p className="text-xl text-muted-foreground mb-8">
              You scored <span className="font-bold text-primary">{score}</span> out of {QUESTIONS.length}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
              <Button variant="outline" size="lg" onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-background py-12">
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h2 className="font-headline font-bold text-2xl">Final Assessment</h2>
            <p className="text-sm text-muted-foreground">Course Module {params.id}</p>
          </div>
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg text-primary font-bold">
            <Timer className="h-5 w-5" />
            {formatTime(timeLeft)}
          </div>
        </div>

        <Card className="border-primary/10 shadow-lg">
          <CardHeader className="space-y-4">
            <div className="flex justify-between items-center">
              <Badge variant="outline">Question {currentIdx + 1} of {QUESTIONS.length}</Badge>
              <Progress value={progress} className="w-1/2 h-2" />
            </div>
            <CardTitle className="text-2xl font-headline leading-tight">
              {currentQ.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selected?.toString()} onValueChange={(v) => setSelected(parseInt(v))}>
              {currentQ.options.map((option, i) => (
                <div key={i} className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer hover:bg-muted/50 ${selected === i ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/20'}`} onClick={() => setSelected(i)}>
                  <RadioGroupItem value={i.toString()} id={`option-${i}`} />
                  <Label htmlFor={`option-${i}`} className="text-base font-medium flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="justify-between border-t mt-6 pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              Answers are auto-saved
            </div>
            <Button size="lg" onClick={handleNext} disabled={selected === null} className="bg-primary hover:bg-primary/90">
              {currentIdx === QUESTIONS.length - 1 ? "Finish Test" : "Next Question"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
