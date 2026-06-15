import { NextResponse } from 'next/server';
import { getSession, signAccessToken, signRefreshToken, setSession, createCsrfToken } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user: session });
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { full_name, password, mobile_number, profile_picture } = await request.json();
    const db = await getDb();

    const updateDoc: any = {};
    if (full_name !== undefined) {
      updateDoc.full_name = full_name;
    }
    if (mobile_number !== undefined) {
      updateDoc.mobile_number = mobile_number;
    }
    if (profile_picture !== undefined) {
      updateDoc.profile_picture = profile_picture;
    }
    if (password) {
      updateDoc.password_hash = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updateDoc).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    if (session.id === 'dev-admin') {
      const payload = {
        ...session,
        full_name: full_name || session.full_name,
        mobile_number: mobile_number || session.mobile_number,
        profile_picture: profile_picture || session.profile_picture
      };
      const access = await signAccessToken(payload);
      const refresh = await signRefreshToken(payload);
      const csrf = await createCsrfToken();
      await setSession(access, refresh, csrf);
      return NextResponse.json({ user: payload });
    }

    const query = { _id: new ObjectId(session.id) };
    await db.collection('users').updateOne(query, { $set: updateDoc });

    // Fetch the updated user details to regenerate token
    const updatedUser = await db.collection('users').findOne(query);
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const payload = {
      id: updatedUser._id.toString(),
      email: updatedUser.email,
      full_name: updatedUser.full_name || '',
      role: updatedUser.role || 'user',
      mobile_number: updatedUser.mobile_number || '',
      profile_picture: updatedUser.profile_picture || ''
    };

    const access = await signAccessToken(payload);
    const refresh = await signRefreshToken(payload);
    const csrf = await createCsrfToken();
    await setSession(access, refresh, csrf);

    return NextResponse.json({ user: payload });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
