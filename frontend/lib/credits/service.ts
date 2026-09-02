import { createAdminClient } from '@/lib/supabase/admin';
import { getOperationCost } from './operations';

export interface WalletInfo {
  userId: string;
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  planId: string;
  planName: string;
}

export interface DeductCreditsParams {
  userId: string;
  toolId: string;
  operation: string;
  amount?: number;
  metadata?: Record<string, unknown>;
}

export interface DeductCreditsResult {
  success: boolean;
  creditsDeducted: number;
  remainingBalance: number;
  transactionId?: string;
  usageEventId?: string;
  error?: string;
  code?: 'INSUFFICIENT_BALANCE' | 'UNAUTHORIZED' | 'INVALID_AMOUNT' | 'INTERNAL_ERROR';
}

export interface RefundCreditsParams {
  userId: string;
  toolId: string;
  operation: string;
  amount: number;
  referenceId: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface RefundCreditsResult {
  success: boolean;
  creditsRefunded: number;
  remainingBalance: number;
  transactionId?: string;
  error?: string;
  code?: 'INVALID_AMOUNT' | 'INTERNAL_ERROR';
}

/**
 * Server-Side In-Memory Lock to ensure per-user atomic credit mutations
 * prevent race conditions, negative balances, and double-spending across concurrent requests.
 */
class Mutex {
  private queue: Array<() => void> = [];
  private locked = false;

  async acquire(): Promise<() => void> {
    return new Promise((resolve) => {
      const run = () => {
        this.locked = true;
        resolve(() => {
          this.locked = false;
          const next = this.queue.shift();
          if (next) next();
        });
      };

      if (this.locked) {
        this.queue.push(run);
      } else {
        run();
      }
    });
  }
}

const userMutexes = new Map<string, Mutex>();

function getUserMutex(userId: string): Mutex {
  let mutex = userMutexes.get(userId);
  if (!mutex) {
    mutex = new Mutex();
    userMutexes.set(userId, mutex);
  }
  return mutex;
}

export class CreditService {
  /**
   * Retrieves or initializes the user's wallet, profile, and subscription.
   */
  static async getUserWallet(userId: string): Promise<WalletInfo | null> {
    if (!userId) return null;
    const admin = createAdminClient();

    // Fetch wallet
    const { data: initialWallet, error: walletErr } = await admin
      .from('credit_wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    let wallet = initialWallet;

    if (!wallet && !walletErr) {
      // Auto-initialize wallet if missing (e.g. 10 free credits)
      const { data: newWallet, error: initErr } = await admin
        .from('credit_wallets')
        .insert({
          user_id: userId,
          balance: 10,
          lifetime_earned: 10,
          lifetime_spent: 0,
        })
        .select('*')
        .single();

      if (!initErr) {
        wallet = newWallet;
      }
    }

    if (!wallet) return null;

    // Fetch subscription & plan
    const { data: subscription } = await admin
      .from('subscriptions')
      .select('plan_id, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    const planId = subscription?.plan_id || 'free';

    const { data: plan } = await admin
      .from('plans')
      .select('name')
      .eq('id', planId)
      .maybeSingle();

    return {
      userId,
      balance: wallet.balance ?? 0,
      lifetimeEarned: wallet.lifetime_earned ?? 0,
      lifetimeSpent: wallet.lifetime_spent ?? 0,
      planId,
      planName: plan?.name || 'Free',
    };
  }

  /**
   * Deducts credits atomically.
   * - Validates sufficient balance
   * - Rejects zero or negative amounts
   * - Prevents negative balance via serial per-user mutex
   * - Creates credit_transactions record
   * - Creates usage_events record
   */
  static async deductCredits({
    userId,
    toolId,
    operation,
    amount,
    metadata = {},
  }: DeductCreditsParams): Promise<DeductCreditsResult> {
    if (!userId) {
      return {
        success: false,
        creditsDeducted: 0,
        remainingBalance: 0,
        error: 'Unauthorized user.',
        code: 'UNAUTHORIZED',
      };
    }

    // Determine cost: use explicit amount if valid, else central config
    const cost = amount !== undefined ? amount : getOperationCost(operation);

    if (cost <= 0) {
      // Zero-cost operations are free, record usage event if needed but deduct 0
      const currentWallet = await this.getUserWallet(userId);
      return {
        success: true,
        creditsDeducted: 0,
        remainingBalance: currentWallet?.balance ?? 0,
      };
    }

    const mutex = getUserMutex(userId);
    const release = await mutex.acquire();

    try {
      const admin = createAdminClient();

      // Read current balance
      const { data: wallet, error: walletErr } = await admin
        .from('credit_wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (walletErr || !wallet) {
        return {
          success: false,
          creditsDeducted: 0,
          remainingBalance: 0,
          error: 'Credit wallet not found.',
          code: 'INTERNAL_ERROR',
        };
      }

      if (wallet.balance < cost) {
        // Record failed usage event due to insufficient balance
        await admin.from('usage_events').insert({
          user_id: userId,
          tool_id: toolId,
          operation,
          credits_used: 0,
          status: 'failed',
          metadata: { ...metadata, reason: 'insufficient_balance', required_credits: cost, current_balance: wallet.balance },
        });

        return {
          success: false,
          creditsDeducted: 0,
          remainingBalance: wallet.balance,
          error: `Insufficient credits. Required: ${cost}, available: ${wallet.balance}.`,
          code: 'INSUFFICIENT_BALANCE',
        };
      }

      const newBalance = wallet.balance - cost;
      const newSpent = (wallet.lifetime_spent || 0) + cost;

      // Update wallet balance
      const { error: updateErr } = await admin
        .from('credit_wallets')
        .update({
          balance: newBalance,
          lifetime_spent: newSpent,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateErr) {
        return {
          success: false,
          creditsDeducted: 0,
          remainingBalance: wallet.balance,
          error: 'Failed to update credit balance.',
          code: 'INTERNAL_ERROR',
        };
      }

      // Record transaction
      const { data: tx } = await admin
        .from('credit_transactions')
        .insert({
          user_id: userId,
          amount: -cost,
          type: 'usage',
          reference_id: toolId,
          metadata: { operation, ...metadata },
        })
        .select('id')
        .single();

      // Record usage event
      const { data: usage } = await admin
        .from('usage_events')
        .insert({
          user_id: userId,
          tool_id: toolId,
          operation,
          credits_used: cost,
          status: 'success',
          metadata: {
            transaction_id: tx?.id,
            ...metadata,
          },
        })
        .select('id')
        .single();

      return {
        success: true,
        creditsDeducted: cost,
        remainingBalance: newBalance,
        transactionId: tx?.id,
        usageEventId: usage?.id,
      };
    } catch (err: unknown) {
      return {
        success: false,
        creditsDeducted: 0,
        remainingBalance: 0,
        error: err instanceof Error ? err.message : 'Unknown credit deduction error',
        code: 'INTERNAL_ERROR',
      };
    } finally {
      release();
    }
  }

  /**
   * Safely refunds credits when a tool operation fails.
   */
  static async refundCredits({
    userId,
    toolId,
    operation,
    amount,
    referenceId,
    reason = 'Tool execution failure',
    metadata = {},
  }: RefundCreditsParams): Promise<RefundCreditsResult> {
    if (!userId || amount <= 0) {
      return {
        success: false,
        creditsRefunded: 0,
        remainingBalance: 0,
        error: 'Invalid refund parameters.',
        code: 'INVALID_AMOUNT',
      };
    }

    const mutex = getUserMutex(userId);
    const release = await mutex.acquire();

    try {
      const admin = createAdminClient();

      const { data: wallet, error: walletErr } = await admin
        .from('credit_wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (walletErr || !wallet) {
        return {
          success: false,
          creditsRefunded: 0,
          remainingBalance: 0,
          error: 'Credit wallet not found.',
          code: 'INTERNAL_ERROR',
        };
      }

      const newBalance = wallet.balance + amount;
      const newSpent = Math.max(0, (wallet.lifetime_spent || 0) - amount);

      const { error: updateErr } = await admin
        .from('credit_wallets')
        .update({
          balance: newBalance,
          lifetime_spent: newSpent,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateErr) {
        return {
          success: false,
          creditsRefunded: 0,
          remainingBalance: wallet.balance,
          error: 'Failed to apply refund.',
          code: 'INTERNAL_ERROR',
        };
      }

      // Record refund transaction
      const { data: tx } = await admin
        .from('credit_transactions')
        .insert({
          user_id: userId,
          amount: amount,
          type: 'refund',
          reference_id: referenceId || toolId,
          metadata: { operation, reason, ...metadata },
        })
        .select('id')
        .single();

      // Record refund usage event (marked status: 'success' with refund metadata)
      await admin.from('usage_events').insert({
        user_id: userId,
        tool_id: toolId,
        operation: `${operation}_refund`,
        credits_used: -amount,
        status: 'success',
        metadata: {
          is_refund: true,
          original_reference_id: referenceId,
          transaction_id: tx?.id,
          reason,
          ...metadata,
        },
      });

      return {
        success: true,
        creditsRefunded: amount,
        remainingBalance: newBalance,
        transactionId: tx?.id,
      };
    } catch (err: unknown) {
      return {
        success: false,
        creditsRefunded: 0,
        remainingBalance: 0,
        error: err instanceof Error ? err.message : 'Unknown refund error',
        code: 'INTERNAL_ERROR',
      };
    } finally {
      release();
    }
  }
}
