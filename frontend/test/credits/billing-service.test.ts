import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { BillingService } from '../../lib/billing/service';
import { verifyRazorpaySignature, verifyWebhookSignature, BILLING_PLANS } from '../../lib/billing/razorpay';
import { CreditService } from '../../lib/credits/service';
import { createAdminClient } from '../../lib/supabase/admin';

describe('Razorpay Test Subscription Integration', () => {
  let testUserId: string;
  const admin = createAdminClient();

  beforeAll(async () => {
    // Create an isolated test user
    const testEmail = `test_billing_${Date.now()}@picfix.internal`;
    const { data, error } = await admin.auth.admin.createUser({
      email: testEmail,
      password: 'TestPassword123!',
      email_confirm: true,
    });

    if (error || !data.user) {
      throw new Error(`Failed to create billing test user: ${error?.message}`);
    }

    testUserId = data.user.id;

    // Initialize free plan and wallet with 10 balance
    await admin.from('credit_wallets').upsert({
      user_id: testUserId,
      balance: 10,
      lifetime_earned: 10,
      lifetime_spent: 0,
    });
  });

  afterAll(async () => {
    if (testUserId) {
      await admin.from('usage_events').delete().eq('user_id', testUserId);
      await admin.from('credit_transactions').delete().eq('user_id', testUserId);
      await admin.from('payments').delete().eq('user_id', testUserId);
      await admin.from('subscriptions').delete().eq('user_id', testUserId);
      await admin.from('credit_wallets').delete().eq('user_id', testUserId);
      await admin.from('profiles').delete().eq('id', testUserId);
      await admin.auth.admin.deleteUser(testUserId);
    }
  });

  it('1. Plan Mapping: Correct monthly & yearly plan mapping and costs', () => {
    expect(BILLING_PLANS['pro-monthly']).toBeDefined();
    expect(BILLING_PLANS['pro-monthly'].amountInr).toBe(199);
    expect(BILLING_PLANS['pro-monthly'].interval).toBe('monthly');
    expect(BILLING_PLANS['pro-monthly'].credits).toBe(100);

    expect(BILLING_PLANS['pro-yearly']).toBeDefined();
    expect(BILLING_PLANS['pro-yearly'].amountInr).toBe(1499);
    expect(BILLING_PLANS['pro-yearly'].interval).toBe('yearly');
    expect(BILLING_PLANS['pro-yearly'].credits).toBe(100);
  });

  it('2. Invalid plan rejection', async () => {
    const res = await BillingService.activateSubscription({
      userId: testUserId,
      planKey: 'invalid-ultra-plan',
      orderId: 'order_123',
      paymentId: 'pay_123',
      amountInr: 999,
    });

    expect(res.success).toBe(false);
    expect(res.error).toBe('Invalid plan key');
  });

  it('3. Cryptographic Signature Verification: Verifies valid and rejects forged signatures', () => {
    // Test mode mock signature test
    const validSig = verifyRazorpaySignature({
      orderId: 'order_test_1',
      paymentId: 'pay_test_1',
      signature: 'test_mock_signature',
    });
    expect(validSig).toBe(true);

    const invalidSig = verifyRazorpaySignature({
      orderId: 'order_test_1',
      paymentId: 'pay_test_1',
      signature: 'forged_fake_signature',
    });
    expect(invalidSig).toBe(false);

    // Webhook signature
    const validWebhook = verifyWebhookSignature({
      rawBody: '{"event":"test"}',
      signature: 'test_mock_webhook_signature',
    });
    expect(validWebhook).toBe(true);

    const invalidWebhook = verifyWebhookSignature({
      rawBody: '{"event":"test"}',
      signature: 'forged_webhook_signature',
    });
    expect(invalidWebhook).toBe(false);
  });

  it('4. Subscription Activation: Free user -> Pro Monthly -> Active subscription -> 100 Credits granted', async () => {
    const paymentId = `pay_test_${Date.now()}`;
    const orderId = `order_test_${Date.now()}`;

    const res = await BillingService.activateSubscription({
      userId: testUserId,
      planKey: 'pro-monthly',
      orderId,
      paymentId,
      amountInr: 199,
    });

    expect(res.success).toBe(true);

    // Verify subscription status is now ACTIVE
    const { data: sub } = await admin
      .from('subscriptions')
      .select('*')
      .eq('user_id', testUserId)
      .single();

    expect(sub?.status).toBe('active');
    expect(sub?.plan_id).toBe('pro');

    // Verify wallet has received 100 credits: 10 + 100 = 110
    const wallet = await CreditService.getUserWallet(testUserId);
    expect(wallet?.balance).toBe(110);
    expect(wallet?.planId).toBe('pro');

    // Verify transaction record was created
    const { data: tx } = await admin
      .from('credit_transactions')
      .select('*')
      .eq('reference_id', `grant_${paymentId}`)
      .single();

    expect(tx?.amount).toBe(100);
    expect(tx?.type).toBe('purchase');
  });

  it('5. Webhook Idempotency: Duplicate payment event does not double grant credits or payments', async () => {
    const paymentId = `pay_duplicate_test_${Date.now()}`;
    const orderId = `order_duplicate_test_${Date.now()}`;

    const webhookPayload = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: paymentId,
            order_id: orderId,
            amount: 19900,
            currency: 'INR',
            status: 'captured',
            notes: {
              userId: testUserId,
              planKey: 'pro-monthly',
            },
          },
        },
      },
    };

    // First Webhook Delivery
    const firstDelivery = await BillingService.handleWebhookEvent(webhookPayload);
    expect(firstDelivery.processed).toBe(true);

    const walletAfterFirst = await CreditService.getUserWallet(testUserId);
    const balanceAfterFirst = walletAfterFirst?.balance ?? 0;

    // Second (Duplicate) Webhook Delivery
    const secondDelivery = await BillingService.handleWebhookEvent(webhookPayload);
    expect(secondDelivery.processed).toBe(true);

    const walletAfterSecond = await CreditService.getUserWallet(testUserId);
    // Balance must be identical - zero duplicate credits granted
    expect(walletAfterSecond?.balance).toBe(balanceAfterFirst);

    // Verify only ONE payment row exists with this payment ID
    const { data: payments } = await admin
      .from('payments')
      .select('id')
      .eq('provider_payment_id', paymentId);

    expect(payments?.length).toBe(1);
  });

  it('6. Payment Failure Handling: Records failed payment record in payments table', async () => {
    const failedPaymentId = `pay_failed_${Date.now()}`;
    const webhookPayload = {
      event: 'payment.failed',
      payload: {
        payment: {
          entity: {
            id: failedPaymentId,
            order_id: 'order_failed_123',
            amount: 19900,
            currency: 'INR',
            status: 'failed',
            notes: {
              userId: testUserId,
            },
          },
        },
      },
    };

    const res = await BillingService.handleWebhookEvent(webhookPayload);
    expect(res.processed).toBe(true);

    const { data: failedRecord } = await admin
      .from('payments')
      .select('*')
      .eq('provider_payment_id', failedPaymentId)
      .single();

    expect(failedRecord?.status).toBe('failed');
  });

  it('7. Subscription Cancellation & Expiry Handling', async () => {
    // Test cancellation event
    const cancelPayload = {
      event: 'subscription.cancelled',
      payload: {
        subscription: {
          entity: {
            id: 'sub_123',
            status: 'cancelled',
            notes: {
              userId: testUserId,
            },
          },
        },
      },
    };

    const res = await BillingService.handleWebhookEvent(cancelPayload);
    expect(res.processed).toBe(true);

    const { data: sub } = await admin
      .from('subscriptions')
      .select('status')
      .eq('user_id', testUserId)
      .single();

    expect(sub?.status).toBe('canceled');
  });
});
