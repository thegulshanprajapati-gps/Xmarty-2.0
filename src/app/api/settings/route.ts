import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession, verifyCsrf } from '@/lib/auth';

export async function GET() {
  try {
    const db = await getDb();
    const collection = db.collection('site_settings');
    const settings = await collection.find({}).sort({ updated_at: -1 }).limit(1).toArray();
    
    if (settings.length > 0) {
      const data = settings[0];
      return NextResponse.json({
        ...data,
        id: data._id.toString()
      });
    }
    
    return NextResponse.json(null);
  } catch (error: any) {
    console.error('Failed to fetch site settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ok = await verifyCsrf(request);
    if (!ok) return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });

    const data = await request.json();
    const db = await getDb();
    const collection = db.collection('site_settings');

    const update = {
      $set: {
        ...data,
        updated_at: new Date()
      },
      $setOnInsert: {
        created_at: new Date()
      }
    };

    // Assuming a single document for settings, e.g. type: 'global'
    await collection.updateOne({ type: 'global' }, update, { upsert: true });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to save site settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
