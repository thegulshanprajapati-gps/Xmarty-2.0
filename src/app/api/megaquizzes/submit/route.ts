import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const { email, name, score, correctAnswers, totalQuestions, timeSpent, autoSubmitted } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Student email is required to submit test results.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const db = await getDb();

    // 1. Record the attempt in mega_quiz_attempts
    const attempt = {
      name,
      email: normalizedEmail,
      score,
      correctAnswers,
      totalQuestions,
      timeSpent,
      autoSubmitted,
      submittedAt: new Date()
    };
    await db.collection('mega_quiz_attempts').insertOne(attempt);

    // 2. Update registration status in mega_quiz_registrations
    await db.collection('mega_quiz_registrations').updateOne(
      { email: normalizedEmail },
      { 
        $set: { 
          testAttempted: true, 
          finalScore: score, 
          lastAttemptedAt: new Date() 
        } 
      }
    );

    return NextResponse.json({ success: true, message: 'Assessment attempt saved successfully!' });
  } catch (err: any) {
    console.error('Mega Quiz submit error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
