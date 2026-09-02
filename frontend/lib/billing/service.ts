import { createAdminClient } from '@/lib/supabase/admin';
import { BILLING_PLANS } from './razorpay';

export interface ProcessPaymentParams {
  userId: string;
  planKey: string;
  orderId: string;
  paymentId: string;
  amountInr: number;
  metadata?: Record<string, unknown>;
}

export interface WebhookEventPayload {
  event: string;
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        currency: string;
        status: string;
        notes?: Record<string, string>;
      };
    };
    subscription?: {
      entity: {
        id: string;
        plan_id?: string;
        status: string;
        current_start?: number;
        current_end?: number;
        notes?: Record<string, string>;
      };
    };
  };
}

export class BillingService {
  /**
   * Activates a subscription and grants credits idempotently upon verified payment.
   */
  static async activateSubscription({
    userId,
    planKey,
    orderId,
    paymentId,
    amountInr,
    metadata = {},
  }: ProcessPaymentParams): Promise<{ success: boolean; error?: string }> {
    const admin = createAdminClient();
    const planConfig = BILLING_PLANS[planKey];

    if (!planConfig) {
      return { success: false, error: 'Invalid plan key' };
    }

    // 1. Idempotency Check: check if paymentId already processed
    const { data: existingPayment } = await admin
      .from('payments')
      .select('id, status')
      .eq('provider_payment_id', paymentId)
      .maybeSingle();

    if (existingPayment && existingPayment.status === 'captured') {
      // Already processed! Idempotently return success without double-granting credits.
      return { success: true };
    }

    // 2. Fetch plan details from Supabase plans table
    const { data: planRecord } = await admin
      .from('plans')
      .select('*')
      .eq('id', planConfig.id)
      .single();

    const monthlyCredits = planRecord?.monthly_ai_credits || planConfig.credits;

    // 3. Record/Upsert Payment in payments table
    if (existingPayment) {
      await admin
        .from('payments')
        .update({
          status: 'captured',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingPayment.id);
    } else {
      await admin.from('payments').insert({
        user_id: userId,
        provider: 'razorpay',
        provider_payment_id: paymentId,
        provider_order_id: orderId,
        amount_inr: amountInr,
        currency: 'INR',
        status: 'captured',
        product_type: 'subscription',
        product_id: planConfig.id,
        metadata: {
          plan_key: planKey,
          interval: planConfig.interval,
          ...metadata,
        },
      });
    }

    // 4. Update / Upsert Subscriptions table
    const now = new Date();
    const periodStart = now.toISOString();
    const periodEnd = new Date(
      planConfig.interval === 'yearly'
        ? now.setFullYear(now.getFullYear() + 1)
        : now.setMonth(now.getMonth() + 1)
    ).toISOString();

    const { data: existingSub } = await admin
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingSub) {
      await admin
        .from('subscriptions')
        .update({
          plan_id: planConfig.id,
          status: 'active',
          provider: 'razorpay',
          provider_subscription_id: orderId,
          current_period_start: periodStart,
          current_period_end: periodEnd,
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSub.id);
    } else {
      await admin.from('subscriptions').insert({
        user_id: userId,
        plan_id: planConfig.id,
        status: 'active',
        provider: 'razorpay',
        provider_subscription_id: orderId,
        current_period_start: periodStart,
        current_period_end: periodEnd,
        cancel_at_period_end: false,
      });
    }

    // 5. Idempotent Credit Grant: Check credit_transactions reference_id
    const grantReferenceId = `grant_${paymentId}`;
    const { data: existingGrant } = await admin
      .from('credit_transactions')
      .select('id')
      .eq('reference_id', grantReferenceId)
      .maybeSingle();

    if (!existingGrant) {
      // Fetch wallet
      const { data: wallet } = await admin
        .from('credit_wallets')
        .select('balance, lifetime_earned')
        .eq('user_id', userId)
        .single();

      const currentBalance = wallet?.balance ?? 0;
      const currentEarned = wallet?.lifetime_earned ?? 0;

      await admin
        .from('credit_wallets')
        .update({
          balance: currentBalance + monthlyCredits,
          lifetime_earned: currentEarned + monthlyCredits,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      await admin.from('credit_transactions').insert({
        user_id: userId,
        amount: monthlyCredits,
        type: 'purchase',
        reference_id: grantReferenceId,
        metadata: {
          reason: 'subscription_activation',
          plan_id: planConfig.id,
          order_id: orderId,
          payment_id: paymentId,
        },
      });
    }

    return { success: true };
  }

  /**
   * Processes a webhook event idempotently.
   */
  static async handleWebhookEvent(event: WebhookEventPayload): Promise<{ processed: boolean; error?: string }> {
    const admin = createAdminClient();

    switch (event.event) {
      case 'payment.captured': {
        const paymentEntity = event.payload.payment?.entity;
        if (!paymentEntity) return { processed: false, error: 'No payment entity' };

        const orderId = paymentEntity.order_id;
        const paymentId = paymentEntity.id;
        const notes = paymentEntity.notes || {};
        const userId = notes.userId;
        const planKey = notes.planKey;

        if (!userId || !planKey) {
          return { processed: false, error: 'Missing userId or planKey in payment notes' };
        }

        const amountInr = Math.round(paymentEntity.amount / 100);

        return await this.activateSubscription({
          userId,
          planKey,
          orderId,
          paymentId,
          amountInr,
          metadata: { webhook_event: event.event },
        }).then((res) => ({ processed: res.success, error: res.error }));
      }

      case 'payment.failed': {
        const paymentEntity = event.payload.payment?.entity;
        if (!paymentEntity) return { processed: false, error: 'No payment entity' };

        const notes = paymentEntity.notes || {};
        const userId = notes.userId;

        if (userId) {
          await admin.from('payments').insert({
            user_id: userId,
            provider: 'razorpay',
            provider_payment_id: paymentEntity.id,
            provider_order_id: paymentEntity.order_id,
            amount_inr: Math.round(paymentEntity.amount / 100),
            currency: paymentEntity.currency || 'INR',
            status: 'failed',
            product_type: 'subscription',
            metadata: { error_description: 'Payment failed' },
          });
        }
        return { processed: true };
      }

      case 'subscription.cancelled':
      case 'subscription.expired': {
        const subEntity = event.payload.subscription?.entity;
        const notes = subEntity?.notes || {};
        const userId = notes.userId;

        if (userId) {
          await admin
            .from('subscriptions')
            .update({
              status: event.event === 'subscription.cancelled' ? 'canceled' : 'expired',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);
        }
        return { processed: true };
      }

      default:
        return { processed: true };
    }
  }
}
