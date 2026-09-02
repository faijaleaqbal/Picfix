import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CreditService } from '@/lib/credits/service';

export async function GET() {
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

    const wallet = await CreditService.getUserWallet(user.id);

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found', code: 'WALLET_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      wallet,
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
