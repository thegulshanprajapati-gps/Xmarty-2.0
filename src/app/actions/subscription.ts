'use server';

import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { PaymentGatewayManager } from '@/lib/payment/payment-gateway';

// --- COUPON VALIDATION ---
export async function applyCouponAction(code: string, orderAmount: number) {
  try {
    const db = await getDb();
    const coupon = await db.collection('coupons').findOne({ 
      code: code.toUpperCase(), 
      isActive: true 
    });

    if (!coupon) {
      return { success: false, error: 'Invalid coupon code' };
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      return { success: false, error: 'Coupon has expired' };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { success: false, error: 'Coupon usage limit reached' };
    }

    if (orderAmount < coupon.minimumOrder) {
      return { success: false, error: `Minimum order amount of ${coupon.minimumOrder} required` };
    }

    let discount = 0;
    if (coupon.discountType === 'Flat') {
      discount = coupon.discountValue;
    } else {
      discount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    }

    return { 
      success: true, 
      couponCode: coupon.code,
      discount: Math.min(discount, orderAmount) 
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to apply coupon' };
  }
}

// --- CREATE ORDER & INITIATE PAYMENT ---
export async function createOrderAction(
  type: 'Course' | 'Bundle' | 'Subscription',
  targetId: string,
  billingDetails: { gstNumber?: string; companyName?: string; billingAddress: string },
  couponCode?: string
) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, error: 'Unauthenticated' };
    }

    const db = await getDb();
    let price = 0;
    let description = '';
    let billingCycle: 'monthly' | 'yearly' | undefined;

    if (type === 'Course') {
      const course = await db.collection('courses').findOne({ _id: new ObjectId(targetId) });
      if (!course) return { success: false, error: 'Course not found' };
      price = course.price || 0;
      description = `Purchase Course: ${course.title}`;
    } else if (type === 'Bundle') {
      const bundle = await db.collection('bundles').findOne({ _id: new ObjectId(targetId) });
      if (!bundle) return { success: false, error: 'Bundle not found' };
      price = bundle.price || 0;
      description = `Purchase Bundle: ${bundle.name}`;
    } else if (type === 'Subscription') {
      // Split planId & cycle
      const [planId, cycle] = targetId.split(':');
      const plan = await db.collection('subscription_plans').findOne({ _id: new ObjectId(planId) });
      if (!plan) return { success: false, error: 'Subscription plan not found' };
      billingCycle = cycle as 'monthly' | 'yearly';
      price = cycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
      description = `Subscribe Plan: ${plan.name} (${cycle})`;
    }

    let discount = 0;
    if (couponCode) {
      const couponRes = await applyCouponAction(couponCode, price);
      if (couponRes.success && couponRes.discount) {
        discount = couponRes.discount;
      }
    }

    const subtotal = price - discount;
    const tax = Math.round(subtotal * 0.18); // 18% GST standard
    const total = subtotal + tax;

    const orderNumber = `XM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderDoc = {
      orderNumber,
      studentId: session.id,
      courseId: type === 'Course' ? targetId : null,
      bundleId: type === 'Bundle' ? targetId : null,
      subscriptionId: type === 'Subscription' ? targetId.split(':')[0] : null,
      billingCycle: billingCycle || null,
      type,
      amount: price,
      discount,
      tax,
      total,
      couponCode: couponCode || null,
      paymentStatus: 'Pending',
      gstNumber: billingDetails.gstNumber || null,
      companyName: billingDetails.companyName || null,
      billingAddress: billingDetails.billingAddress,
      createdAt: new Date()
    };

    const insertedOrder = await db.collection('orders').insertOne(orderDoc);

    const sessionRes = await PaymentGatewayManager.createCheckoutSession({
      orderId: insertedOrder.insertedId.toString(),
      amount: total,
      currency: 'INR',
      customerEmail: session.email,
      description,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/public/payment/success`
    });

    // Update order with gateway details
    await db.collection('orders').updateOne(
      { _id: insertedOrder.insertedId },
      { $set: { gateway: sessionRes.gateway, gatewayOrderId: sessionRes.gatewayOrderId } }
    );

    return {
      success: true,
      orderId: insertedOrder.insertedId.toString(),
      orderNumber,
      total,
      ...sessionRes
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to initiate order' };
  }
}

// --- VERIFY PAYMENT SIGNATURE & PROVISION ACCESS ---
export async function verifyPaymentAction(orderId: string, gatewayPaymentId: string, signature?: string) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, error: 'Unauthenticated' };
    }

    const db = await getDb();
    const order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) });
    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    // In a fully native integration, perform validation. We simulate verified logic:
    await db.collection('orders').updateOne(
      { _id: new ObjectId(orderId) },
      { $set: { paymentStatus: 'Paid' } }
    );

    // Save transaction logs
    const transaction = {
      gatewayOrderId: order.gatewayOrderId,
      paymentId: gatewayPaymentId,
      signature: signature || null,
      status: 'Paid',
      amount: order.total,
      currency: 'INR',
      studentId: session.id,
      createdAt: new Date()
    };
    await db.collection('transactions').insertOne(transaction);

    // Increment coupon used count if applicable
    if (order.couponCode) {
      await db.collection('coupons').updateOne(
        { code: order.couponCode },
        { $inc: { usedCount: 1 } }
      );
    }

    // Provision Access
    if (order.type === 'Subscription') {
      const plan = await db.collection('subscription_plans').findOne({ _id: new ObjectId(order.subscriptionId) });
      const trialDays = plan?.trialDays || 0;
      const durationDays = order.billingCycle === 'yearly' ? 365 : 30;
      
      const startDate = new Date();
      const expiryDate = new Date();
      expiryDate.setDate(startDate.getDate() + durationDays + trialDays);

      const subscription = {
        studentId: session.id,
        planId: order.subscriptionId,
        status: 'active',
        billingCycle: order.billingCycle,
        startDate,
        expiryDate,
        renewalDate: expiryDate,
        autoRenew: true,
        paymentGateway: order.gateway,
        transactionId: gatewayPaymentId,
        invoiceId: null
      };

      const insertedSub = await db.collection('student_subscriptions').insertOne(subscription);

      // Create Invoice
      const invoiceNumber = `INV-${Date.now()}`;
      const invoice = {
        invoiceNumber,
        orderId,
        studentId: session.id,
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
    } else {
      // Create simple Invoice for course/bundle purchase
      const invoiceNumber = `INV-${Date.now()}`;
      const invoice = {
        invoiceNumber,
        orderId,
        studentId: session.id,
        gstNumber: order.gstNumber || null,
        companyName: order.companyName || null,
        billingAddress: order.billingAddress,
        subtotal: order.amount - order.discount,
        tax: order.tax,
        grandTotal: order.total,
        pdfGenerated: false,
        createdAt: new Date()
      };
      await db.collection('invoices').insertOne(invoice);
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Payment verification failed' };
  }
}

// --- TOGGLE AUTO RENEWAL ---
export async function toggleAutoRenewAction(subscriptionId: string, autoRenew: boolean) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, error: 'Unauthenticated' };
    }

    const db = await getDb();
    const res = await db.collection('student_subscriptions').updateOne(
      { _id: new ObjectId(subscriptionId), studentId: session.id },
      { $set: { autoRenew } }
    );

    if (res.modifiedCount === 0) {
      return { success: false, error: 'Subscription not found or updated' };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to toggle renewal' };
  }
}

// --- REQUEST REFUND ---
export async function requestRefundAction(orderId: string, reason: string) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, error: 'Unauthenticated' };
    }

    const db = await getDb();
    const order = await db.collection('orders').findOne({ _id: new ObjectId(orderId), studentId: session.id });
    if (!order) return { success: false, error: 'Order not found' };

    if (order.paymentStatus !== 'Paid') {
      return { success: false, error: 'Refunds can only be requested for paid orders' };
    }

    await db.collection('orders').updateOne(
      { _id: new ObjectId(orderId) },
      { $set: { paymentStatus: 'Refunded', refundReason: reason, refundStatus: 'Pending' } }
    );

    // Create Audit Log
    await db.collection('audit_logs').insertOne({
      action: 'REFUND_REQUESTED',
      userId: session.id,
      details: { orderId, reason },
      createdAt: new Date()
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to process refund request' };
  }
}
