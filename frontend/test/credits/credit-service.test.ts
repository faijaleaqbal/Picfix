import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { CreditService } from '../../lib/credits/service';
import { createAdminClient } from '../../lib/supabase/admin';

describe('CreditService Production Ledger & Guardrails', () => {
  let testUserId: string;
  const admin = createAdminClient();

  beforeAll(async () => {
    // Create an isolated test user in Supabase auth
    const testEmail = `test_credits_${Date.now()}@picfix.internal`;
    const { data, error } = await admin.auth.admin.createUser({
      email: testEmail,
      password: 'TestPassword123!',
      email_confirm: true,
    });

    if (error || !data.user) {
      throw new Error(`Failed to set up test user: ${error?.message}`);
    }

    testUserId = data.user.id;

    // Reset wallet to clean 10 balance
    await admin
      .from('credit_wallets')
      .upsert({
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
      await admin.from('credit_wallets').delete().eq('user_id', testUserId);
      await admin.from('subscriptions').delete().eq('user_id', testUserId);
      await admin.from('profiles').delete().eq('id', testUserId);
      await admin.auth.admin.deleteUser(testUserId);
    }
  });

  it('1. Sufficient balance: deducts credits correctly and records transactions', async () => {
    const res = await CreditService.deductCredits({
      userId: testUserId,
      toolId: 'bg-remove-1',
      operation: 'background-removal', // cost: 1
    });

    expect(res.success).toBe(true);
    expect(res.creditsDeducted).toBe(1);
    expect(res.remainingBalance).toBe(9);
    expect(res.transactionId).toBeDefined();
    expect(res.usageEventId).toBeDefined();

    const wallet = await CreditService.getUserWallet(testUserId);
    expect(wallet?.balance).toBe(9);
  });

  it('2. Insufficient balance: rejects deduction when balance is lower than cost', async () => {
    // Cost 10 (4k-upscale) while balance is 9
    const res = await CreditService.deductCredits({
      userId: testUserId,
      toolId: 'upscale-1',
      operation: '4k-upscale', // cost: 10
    });

    expect(res.success).toBe(false);
    expect(res.code).toBe('INSUFFICIENT_BALANCE');
    expect(res.remainingBalance).toBe(9);

    // Ensure balance did not change
    const wallet = await CreditService.getUserWallet(testUserId);
    expect(wallet?.balance).toBe(9);
  });

  it('3. Concurrent deduction: serializes parallel requests and prevents double spending / negative balance', async () => {
    // Balance is 9.
    // Try running 5 concurrent requests of cost 2 ("ai-enhance"). Total cost = 10.
    // Exactly 4 should succeed (cost 8, remaining 1), and 1 should fail with INSUFFICIENT_BALANCE.
    const promises = Array.from({ length: 5 }, (_, i) =>
      CreditService.deductCredits({
        userId: testUserId,
        toolId: `enhance-concurrent-${i}`,
        operation: 'ai-enhance', // cost: 2
      })
    );

    const results = await Promise.all(promises);

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    expect(successful.length).toBe(4);
    expect(failed.length).toBe(1);
    expect(failed[0].code).toBe('INSUFFICIENT_BALANCE');

    const wallet = await CreditService.getUserWallet(testUserId);
    expect(wallet?.balance).toBe(1); // 9 - 8 = 1
  });

  it('4. Failed operation refund: restores credits safely and records refund transaction', async () => {
    const refundRes = await CreditService.refundCredits({
      userId: testUserId,
      toolId: 'enhance-fail-1',
      operation: 'ai-enhance',
      amount: 2,
      referenceId: 'ref-enhance-123',
      reason: 'AI upstream timeout',
    });

    expect(refundRes.success).toBe(true);
    expect(refundRes.creditsRefunded).toBe(2);
    expect(refundRes.remainingBalance).toBe(3); // 1 + 2 = 3

    const wallet = await CreditService.getUserWallet(testUserId);
    expect(wallet?.balance).toBe(3);
  });

  it('5. Unauthorized user: rejects unauthorized user deduction', async () => {
    const res = await CreditService.deductCredits({
      userId: '',
      toolId: 'tool-anon',
      operation: 'background-removal',
    });

    expect(res.success).toBe(false);
    expect(res.code).toBe('UNAUTHORIZED');
  });

  it('6. Zero/Negative credit attempts: rejects invalid amounts or treats zero-cost as free', async () => {
    // Free operation (cost 0) should not deduct
    const freeRes = await CreditService.deductCredits({
      userId: testUserId,
      toolId: 'crop-free',
      operation: 'crop-image', // not an AI paid op -> cost 0
    });

    expect(freeRes.success).toBe(true);
    expect(freeRes.creditsDeducted).toBe(0);
    expect(freeRes.remainingBalance).toBe(3);

    // Negative refund attempt
    const negRefund = await CreditService.refundCredits({
      userId: testUserId,
      toolId: 'tool-neg',
      operation: 'background-removal',
      amount: -5,
      referenceId: 'ref-neg',
    });

    expect(negRefund.success).toBe(false);
    expect(negRefund.code).toBe('INVALID_AMOUNT');
  });
});
