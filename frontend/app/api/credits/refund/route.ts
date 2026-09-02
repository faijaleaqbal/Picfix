import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CreditService } from '@/lib/credits/service';

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
    const { toolId, operation, amount, referenceId, reason, metadata } = body;

    if (!toolId || !operation || !amount || !referenceId) {
      return NextResponse.json(
        { error: 'toolId, operation, amount, and referenceId are required.', code: 'INVALID_PARAM' },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number.', code: 'INVALID_AMOUNT' },
        { status: 400 }
      );
    }

    const result = await CreditService.refundCredits({
      userId: user.id,
      toolId,
      operation,
      amount,
      referenceId,
      reason,
      metadata,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
