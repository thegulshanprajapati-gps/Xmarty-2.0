import { getSession } from "@/lib/auth";
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { subscription } = await request.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }

    const session = await getSession();
    const userId = session?.id || null;
    const userEmail = session?.email || null;

    const db = await getDb();
    
    // Store subscription in the 'push_subscriptions' collection.
    // Use the endpoint as a unique filter to upsert to prevent duplicates.
    await db.collection('push_subscriptions').updateOne(
      { "subscription.endpoint": subscription.endpoint },
      { 
        $set: { 
          subscription,
          user_id: userId,
          user_email: userEmail,
          updated_at: new Date().toISOString()
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[SUBSCRIBE NOTIFICATION ERROR]', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
