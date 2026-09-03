import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { type EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/';
  const error = searchParams.get('error');
  const errorCode = searchParams.get('error_code');
  const errorDescription = searchParams.get('error_description');

  // Determine actual external origin considering reverse proxies (Nginx / Vercel / Cloudflare)
  const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https';
  const siteUrl = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : origin;

  // If Supabase returned an error in the query parameters (e.g. otp_expired, access_denied)
  if (error || errorDescription) {
    console.error('[auth/callback] Supabase Auth error in query params:', {
      error,
      errorCode,
      errorDescription,
    });
    const message = errorDescription || error || 'auth_callback_failed';
    return NextResponse.redirect(`${siteUrl}/login?error=${encodeURIComponent(message)}`);
  }

  const supabase = createClient();

  // 1. Verify token_hash for email confirmations / magic links / recovery
  if (token_hash && type) {
    console.log(`[auth/callback] Verifying OTP token_hash with type: ${type}`);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!verifyError) {
      const redirectPath = next.startsWith('/') ? next : `/${next}`;
      return NextResponse.redirect(`${siteUrl}${redirectPath}`);
    }

    console.error('[auth/callback] verifyOtp failed:', verifyError.message);
    return NextResponse.redirect(`${siteUrl}/login?error=${encodeURIComponent(verifyError.message)}`);
  }

  // 2. Exchange PKCE code for session (OAuth and PKCE confirmations)
  if (code) {
    console.log('[auth/callback] Exchanging auth code for session');
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      const redirectPath = next.startsWith('/') ? next : `/${next}`;
      return NextResponse.redirect(`${siteUrl}${redirectPath}`);
    }

    console.error('[auth/callback] exchangeCodeForSession failed:', exchangeError.message);
    return NextResponse.redirect(`${siteUrl}/login?error=${encodeURIComponent(exchangeError.message)}`);
  }

  console.warn('[auth/callback] No code or token_hash found in request URL:', request.url);
  return NextResponse.redirect(`${siteUrl}/login?error=auth_callback_failed`);
}

