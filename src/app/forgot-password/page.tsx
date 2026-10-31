"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthLayout, authButton, authInput } from "@/components/AuthLayout";
import { isDemoEmail } from "@/lib/demo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (isDemoEmail(email.trim())) return setError("Demo accounts share one fixed password, so it can't be reset.");
    setLoading(true);
    const { error } = await createClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${location.origin}/auth/confirm?next=${encodeURIComponent("/reset-password")}`,
    });
    setLoading(false);
    // Don't reveal whether an account exists; only show real failures like rate limits.
    if (error && error.status !== 400 && error.status !== 404) return setError(error.message);
    setSent(true);
  }

  return (
    <AuthLayout>
      {sent ? (
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold">Check your inbox</h1>
          <p className="text-sm text-gray-600">
            If an account exists for <span className="font-semibold text-gray-900">{email.trim()}</span>, we sent a link
            to reset your password. Open it on this device; it works once and expires after an hour.
          </p>
          <button type="button" onClick={() => setSent(false)} className="w-full text-sm text-[#0079bf] hover:underline">
            Use a different email
          </button>
          <Link href="/login" className="block text-sm text-[#0079bf] hover:underline">
            Back to log in
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <h1 className="text-center text-2xl font-bold">Reset your password</h1>
          <p className="text-center text-sm text-gray-600">
            Enter your account email and we&apos;ll send you a link to choose a new password.
          </p>
          <input
            type="email"
            required
            autoFocus
            aria-label="Email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authInput}
          />
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
          <button disabled={loading} className={authButton}>
            {loading ? "Sending…" : "Send reset link"}
          </button>
          <Link href="/login" className="block text-center text-sm text-[#0079bf] hover:underline">
            Back to log in
          </Link>
        </form>
      )}
    </AuthLayout>
  );
}
