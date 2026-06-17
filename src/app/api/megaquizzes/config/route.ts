import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDb();
    let quizConfig = await db.collection('mega_quizzes').findOne({ _id: 'active_mega_quiz' as any });
    if (!quizConfig) {
      quizConfig = await db.collection('mega_quizzes').findOne({});
    }

    if (!quizConfig) {
      return NextResponse.json({
        title: 'Xmarty Mega Live Quiz',
        description: 'Register for the upcoming premium live assessment tracks, track your enrollment verification, and start your test sessions securely.',
        bannerUrl: '',
        timeLimit: 10,
        questionCount: 5
      });
    }

    return NextResponse.json({
      title: quizConfig.title || 'Xmarty Mega Live Quiz',
      description: quizConfig.description || 'Register for the upcoming premium live assessment tracks, track your enrollment verification, and start your test sessions securely.',
      bannerUrl: quizConfig.bannerUrl || '',
      timeLimit: quizConfig.timeLimit || 10,
      questionCount: quizConfig.questions ? quizConfig.questions.length : 0
    });
  } catch (err: any) {
    console.error('Failed to get public mega quiz config:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
