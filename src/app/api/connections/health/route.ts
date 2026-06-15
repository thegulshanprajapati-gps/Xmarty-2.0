import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    const latency = Date.now() - start;
    return NextResponse.json({ success: true, status: 'healthy', latency });
  } catch (error: any) {
    return NextResponse.json({ success: false, status: 'disconnected', error: error.message }, { status: 500 });
  }
}
