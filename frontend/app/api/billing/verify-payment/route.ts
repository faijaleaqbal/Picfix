import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyRazorpaySignature } from '@/lib/billing/razorpay';
import { BillingService } from '@/lib/billing/service';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { orderId, paymentId, signature, planKey, amountInr } = body;

    if (!orderId || !paymentId || !signature || !planKey) {
      return NextResponse.json(
        { error: 'Missing payment verification parameters.', code: 'INVALID_PARAM' },
        { status: 400 }
      );
    }

    // 1. Verify Razorpay cryptographic signature server-side
    const isValid = verifyRazorpaySignature({ orderId, paymentId, signature });
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature. Verification failed.', code: 'INVALID_SIGNATURE' },
        { status: 400 }
      );
    }

    // 2. Activate subscription & grant credits idempotently
    const result = await BillingService.activateSubscription({
      userId: user.id,
      planKey,
      orderId,
      paymentId,
      amountInr: amountInr || (planKey === 'pro-yearly' ? 1499 : 199),
      metadata: { client_verification: true },
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to activate subscription.', code: 'ACTIVATION_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription activated and credits granted successfully.',
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
