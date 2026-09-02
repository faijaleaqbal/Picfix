import { NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/billing/razorpay';
import { BillingService, type WebhookEventPayload } from '@/lib/billing/service';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing x-razorpay-signature header', code: 'MISSING_SIGNATURE' },
        { status: 400 }
      );
    }

    // 1. Cryptographic HMAC validation
    const isValid = verifyWebhookSignature({ rawBody, signature });
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid webhook signature', code: 'INVALID_SIGNATURE' },
        { status: 400 }
      );
    }

    // 2. Parse payload safely
    const eventPayload = JSON.parse(rawBody) as WebhookEventPayload;

    // 3. Process event idempotently
    const result = await BillingService.handleWebhookEvent(eventPayload);

    if (!result.processed) {
      return NextResponse.json(
        { error: result.error || 'Failed to process event', code: 'WEBHOOK_PROCESS_ERROR' },
        { status: 400 }
      );
    }

    return NextResponse.json({ status: 'ok', event: eventPayload.event });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
