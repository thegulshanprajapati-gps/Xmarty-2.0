import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const db = await getDb();

    // Fetch active subscription
    const subscription = await db.collection('student_subscriptions').findOne({
      studentId: session.id,
      status: 'active'
    });

    // Fetch all orders
    const orders = await db.collection('orders')
      .find({ studentId: session.id })
      .sort({ createdAt: -1 })
      .toArray();

    // Fetch all invoices
    const invoices = await db.collection('invoices')
      .find({ studentId: session.id })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      subscription: subscription ? {
        ...subscription,
        id: subscription._id.toString(),
        _id: undefined
      } : null,
      orders: orders.map((o: any) => ({
        ...o,
        id: o._id.toString(),
        _id: undefined
      })),
      invoices: invoices.map((i: any) => ({
        ...i,
        id: i._id.toString(),
        _id: undefined
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
