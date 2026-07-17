import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { PaymentGatewayManager } from '@/lib/payment/payment-gateway';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const gateway = searchParams.get('gateway') as 'Razorpay' | 'Stripe' | 'Cashfree';
    if (!gateway) {
      return NextResponse.json({ error: 'Gateway parameter is required' }, { status: 400 });
    }

    const payload = await req.json();
    const headers = Object.fromEntries(req.headers.entries());

    // Verify webhook payload signature
    const verification = await PaymentGatewayManager.verifyWebhook(gateway, payload, headers);
    if (!verification.isValid || !verification.orderId) {
      return NextResponse.json({ error: 'Signature verification failed' }, { status: 401 });
    }

    const db = await getDb();
    const orderId = verification.orderId;

    const order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Process payment capturing or updates
    if (verification.status === 'Paid') {
      await db.collection('orders').updateOne(
        { _id: new ObjectId(orderId) },
        { $set: { paymentStatus: 'Paid' } }
      );

      // Save verified capture transaction log
      await db.collection('transactions').insertOne({
        gatewayOrderId: order.gatewayOrderId,
        paymentId: verification.gatewayPaymentId,
        status: 'Paid',
        amount: order.total,
        currency: 'INR',
        studentId: order.studentId,
        createdAt: new Date()
      });

      // Provision subscription if type is subscription
      if (order.type === 'Subscription') {
        const plan = await db.collection('subscription_plans').findOne({ _id: new ObjectId(order.subscriptionId) });
        const trialDays = plan?.trialDays || 0;
        const durationDays = order.billingCycle === 'yearly' ? 365 : 30;

        const startDate = new Date();
        const expiryDate = new Date();
        expiryDate.setDate(startDate.getDate() + durationDays + trialDays);

        const subscription = {
          studentId: order.studentId,
          planId: order.subscriptionId,
          status: 'active',
          billingCycle: order.billingCycle,
          startDate,
          expiryDate,
          renewalDate: expiryDate,
          autoRenew: true,
          paymentGateway: gateway,
          transactionId: verification.gatewayPaymentId,
          invoiceId: null
        };

        const insertedSub = await db.collection('student_subscriptions').insertOne(subscription);

        // Generate Invoice
        const invoiceNumber = `INV-${Date.now()}`;
        const invoice = {
          invoiceNumber,
          orderId,
          studentId: order.studentId,
          gstNumber: order.gstNumber || null,
          companyName: order.companyName || null,
          billingAddress: order.billingAddress,
          subtotal: order.amount - order.discount,
          tax: order.tax,
          grandTotal: order.total,
          pdfGenerated: false,
          createdAt: new Date()
        };

        const insertedInvoice = await db.collection('invoices').insertOne(invoice);
        await db.collection('student_subscriptions').updateOne(
          { _id: insertedSub.insertedId },
          { $set: { invoiceId: insertedInvoice.insertedId.toString() } }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
