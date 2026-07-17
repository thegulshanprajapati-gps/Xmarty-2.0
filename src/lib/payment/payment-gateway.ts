import { getDb } from '../mongodb';

export interface CheckoutSessionInput {
  orderId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerPhone?: string;
  description: string;
  redirectUrl: string;
}

export interface CheckoutSessionResult {
  success: boolean;
  gatewayOrderId: string;
  checkoutUrl?: string; // Stripe checkout link
  sdkConfig?: any;      // Razorpay/Cashfree configurations
  error?: string;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  orderId?: string;
  gatewayPaymentId?: string;
  status: 'Paid' | 'Failed' | 'Refunded';
  rawResponse: any;
}

export class PaymentGatewayManager {
  private static async getActiveGateway(): Promise<'Razorpay' | 'Stripe' | 'Cashfree'> {
    try {
      const db = await getDb();
      const settings = await db.collection('site_settings').findOne({});
      return settings?.active_payment_gateway || 'Razorpay';
    } catch {
      return 'Razorpay';
    }
  }

  static async createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSessionResult & { gateway: string }> {
    const gateway = await this.getActiveGateway();

    if (gateway === 'Stripe') {
      return {
        success: true,
        gateway: 'Stripe',
        gatewayOrderId: `stripe_session_${Date.now()}`,
        checkoutUrl: `${input.redirectUrl}?session_id=stripe_${Date.now()}`
      };
    }

    if (gateway === 'Cashfree') {
      return {
        success: true,
        gateway: 'Cashfree',
        gatewayOrderId: `cf_order_${Date.now()}`,
        sdkConfig: {
          paymentSessionId: `cf_session_token_${Date.now()}`,
          orderId: `cf_order_${Date.now()}`
        }
      };
    }

    return {
      success: true,
      gateway: 'Razorpay',
      gatewayOrderId: `rzp_order_${Date.now()}`,
      sdkConfig: {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mockkey123',
        amount: input.amount * 100, // Razorpay works in paise
        currency: input.currency,
        name: "Xmarty Creator",
        description: input.description,
        order_id: `rzp_order_${Date.now()}`,
        prefill: {
          email: input.customerEmail,
          contact: input.customerPhone || ""
        }
      }
    };
  }

  static async verifyWebhook(
    gateway: 'Razorpay' | 'Stripe' | 'Cashfree',
    payload: any,
    headers: any
  ): Promise<WebhookVerificationResult> {
    if (gateway === 'Stripe') {
      const eventType = payload.type;
      if (eventType === 'checkout.session.completed') {
        const orderId = payload.data?.object?.metadata?.orderId;
        return {
          isValid: true,
          orderId,
          gatewayPaymentId: payload.data?.object?.payment_intent,
          status: 'Paid',
          rawResponse: payload
        };
      }
    }

    if (gateway === 'Cashfree') {
      const orderId = payload.order?.order_id;
      const status = payload.payment?.payment_status;
      if (status === 'SUCCESS') {
        return {
          isValid: true,
          orderId,
          gatewayPaymentId: payload.payment?.cf_payment_id,
          status: 'Paid',
          rawResponse: payload
        };
      }
    }

    const event = payload.event;
    if (event === 'order.paid' || event === 'payment.captured') {
      const orderId = payload.payload?.payment?.entity?.order_id;
      const paymentId = payload.payload?.payment?.entity?.id;
      return {
        isValid: true,
        orderId,
        gatewayPaymentId: paymentId,
        status: 'Paid',
        rawResponse: payload
      };
    }

    return {
      isValid: false,
      status: 'Failed',
      rawResponse: payload
    };
  }
}
