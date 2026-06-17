import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const { name, email, number } = await req.json();

    if (!name || !email || !number) {
      return NextResponse.json({ error: 'All fields (name, email, number) are required.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const db = await getDb();
    const collection = db.collection('mega_quiz_registrations');

    // Check if email or number already registered
    const existing = await collection.findOne({
      $or: [
        { email: normalizedEmail },
        { number: number.trim() }
      ]
    });

    if (existing) {
      return NextResponse.json({ error: 'This email or phone number is already registered for the Mega Quiz.' }, { status: 409 });
    }

    const registration = {
      name: name.trim(),
      email: normalizedEmail,
      number: number.trim(),
      status: 'pending',
      registeredAt: new Date()
    };

    await collection.insertOne(registration);

    return NextResponse.json({ success: true, message: 'Registration submitted successfully!' });
  } catch (err: any) {
    console.error('Mega Quiz registration error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
