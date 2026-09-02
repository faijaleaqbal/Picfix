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
    const { toolId, operation, amount, metadata } = body;

    if (!toolId || !operation) {
      return NextResponse.json(
        { error: 'toolId and operation are required.', code: 'INVALID_PARAM' },
        { status: 400 }
      );
    }

    if (amount !== undefined && (typeof amount !== 'number' || amount <= 0)) {
      return NextResponse.json(
        { error: 'Amount must be a positive number.', code: 'INVALID_AMOUNT' },
        { status: 400 }
      );
    }

    const result = await CreditService.deductCredits({
      userId: user.id,
      toolId,
      operation,
      amount,
      metadata,
    });

    if (!result.success) {
      const status = result.code === 'INSUFFICIENT_BALANCE' ? 402 : 400;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
