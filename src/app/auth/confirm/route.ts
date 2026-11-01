import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/safe-next";

// Landing point for links in emails (sign-up confirmation, password reset).
// Supabase sends either a one-time `code` (PKCE) or a `token_hash`; both are
// exchanged here for a session, then the person continues to `next`.
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const next = safeNext(url.searchParams.get("next"));
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const supabase = await createClient();

  let error: { message: string } | null = null;
  if (code) ({ error } = await supabase.auth.exchangeCodeForSession(code));
  else if (tokenHash && type) ({ error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash }));
  else error = { message: url.searchParams.get("error_description") ?? "This link is missing its code." };

  if (error) {
    const msg = /code verifier|both auth code/i.test(error.message)
      ? "Open the link on the same device and browser you used to request it, or request a new one."
      : `That link didn't work: ${error.message}. Links work once and expire; request a new one.`;
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(msg)}`, url.origin));
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
