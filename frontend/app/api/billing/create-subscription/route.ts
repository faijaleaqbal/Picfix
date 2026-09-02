import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { BILLING_PLANS, createRazorpayOrder, getRazorpayCredentials } from '@/lib/billing/razorpay';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to upgrade.', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { planKey } = body;

    const planConfig = BILLING_PLANS[planKey];
    if (!planConfig) {
      return NextResponse.json(
        { error: 'Invalid plan selected. Only pro-monthly and pro-yearly are supported.', code: 'INVALID_PLAN' },
        { status: 400 }
      );
    }

    const receipt = `rcpt_${user.id.substring(0, 8)}_${Date.now()}`;
    const { keyId } = getRazorpayCredentials();

    const order = await createRazorpayOrder({
      amountInr: planConfig.amountInr,
      receipt,
      notes: {
        userId: user.id,
        planKey,
        email: user.email || '',
      },
    });

    return NextResponse.json({
      success: true,
      keyId,
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      planKey,
      planName: `Pro (${planConfig.interval === 'yearly' ? 'Yearly' : 'Monthly'})`,
      user: {
        email: user.email,
        name: user.user_metadata?.full_name || user.email?.split('@')[0],
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
