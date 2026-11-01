"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { safeNext } from "@/lib/safe-next";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/demo";
import { AuthLayout, authButton, authInput } from "@/components/AuthLayout";
import { PasswordField, passwordIsStrong } from "@/components/PasswordField";
import { Avatar } from "@/components/Avatar";

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [mode, setMode] = useState<"signin" | "signup">(params.get("mode") === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(params.get("error"));
  const [notice, setNotice] = useState<string | null>(params.get("notice"));
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  // Confirmation and invitation links bring people back to where they were going.
  const redirectTo = () => `${location.origin}/auth/confirm?next=${encodeURIComponent(next)}`;

  function done() {
    router.replace(next);
    router.refresh();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "signup" && !passwordIsStrong(password)) return;
    setLoading("form");
    setMessage(null);
    setNotice(null);
    setUnconfirmed(false);
    const supabase = createClient();
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      setLoading(null);
      if (error) {
        if (/not confirmed/i.test(error.message)) setUnconfirmed(true);
        return setMessage(error.message);
      }
      return done();
    }
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: redirectTo() },
    });
    setLoading(null);
    if (error) return setMessage(error.message);
    // Supabase answers a sign-up for an already-registered email with a user that
    // has no identities, and sends no email. Say so instead of "check your inbox".
    if (data.user && data.user.identities?.length === 0) {
      setMode("signin");
      setPassword("");
      return setMessage("An account with this email already exists. Log in, or use “Forgot password?” to reset it.");
    }
    if (!data.session) return setSentTo(email.trim());
    done();
  }

  async function signInAsDemo(demoEmail: string) {
    setLoading(demoEmail);
    setMessage(null);
    const { error } = await createClient().auth.signInWithPassword({ email: demoEmail, password: DEMO_PASSWORD });
    setLoading(null);
    if (error) return setMessage(error.message);
    done();
  }

  if (sentTo) return <CheckInbox email={sentTo} redirectTo={redirectTo()} onBack={() => setSentTo(null)} />;

  const signup = mode === "signup";
  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4">
        <h1 className="text-center text-2xl font-bold">{signup ? "Create your account" : "Log in to continue"}</h1>
        {notice && <p className="rounded bg-[#dcfff1] px-3 py-2 text-sm text-[#164b35]">{notice}</p>}
        <input
          type="email"
          required
          aria-label="Email"
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={authInput}
        />
        <PasswordField
          value={password}
          onChange={setPassword}
          autoComplete={signup ? "new-password" : "current-password"}
          placeholder={signup ? "Create a password" : "Password"}
          checklist={signup}
        />
        {!signup && (
          <div className="-mt-2 text-right">
            <Link href="/forgot-password" className="text-sm text-[#0079bf] hover:underline">
              Forgot password?
            </Link>
          </div>
        )}
        {message && (
          <p role="alert" className="text-sm text-red-600">
            {message}
          </p>
        )}
        {unconfirmed && <ResendButton email={email.trim()} redirectTo={redirectTo()} />}
        <button disabled={!!loading || (signup && !passwordIsStrong(password))} className={authButton}>
          {loading === "form" ? "…" : signup ? "Sign up" : "Log in"}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode(signup ? "signin" : "signup");
            setMessage(null);
            setUnconfirmed(false);
          }}
          className="w-full text-sm text-[#0079bf] hover:underline"
        >
          {signup ? "Already have an account? Log in" : "No account? Sign up"}
        </button>
      </form>

      <div className="border-t border-gray-200 pt-4">
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
          Or try a demo account
        </p>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((d) => (
            <button
              key={d.email}
              type="button"
              disabled={!!loading}
              onClick={() => signInAsDemo(d.email)}
              title={`Sign in as ${d.name} (${d.about})`}
              className="flex items-center gap-2 rounded border border-gray-200 p-2 text-left hover:border-[#0079bf] hover:bg-[#e9f2ff] disabled:opacity-60"
            >
              <Avatar email={d.email} size="sm" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">
                  {loading === d.email ? "Signing in…" : d.name}
                </span>
                <span className="block truncate text-[11px] text-gray-500">{d.about}</span>
              </span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-[11px] text-gray-400">Fictional people with shared sample data.</p>
      </div>
    </>
  );
}

function CheckInbox({ email, redirectTo, onBack }: { email: string; redirectTo: string; onBack: () => void }) {
  return (
    <div className="space-y-4 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#e9f2ff] text-2xl" aria-hidden>
        ✉️
      </div>
      <h1 className="text-2xl font-bold">Check your inbox</h1>
      <p className="text-sm text-gray-600">
        We sent a confirmation link to <span className="font-semibold text-gray-900">{email}</span>. Open it on this
        device to finish creating your account. It can take a minute and may land in spam.
      </p>
      <ResendButton email={email} redirectTo={redirectTo} />
      <button type="button" onClick={onBack} className="w-full text-sm text-[#0079bf] hover:underline">
        Back to log in
      </button>
    </div>
  );
}

function ResendButton({ email, redirectTo }: { email: string; redirectTo: string }) {
  const [wait, setWait] = useState(0);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  async function resend() {
    setStatus(null);
    const { error } = await createClient().auth.resend({ type: "signup", email, options: { emailRedirectTo: redirectTo } });
    setStatus(error ? error.message : "Sent! Check your inbox for a new link.");
    setWait(60);
  }

  return (
    <div className="text-center">
      <button
        type="button"
        onClick={resend}
        disabled={wait > 0 || !email}
        className="w-full rounded border border-[#0079bf] py-2 text-sm font-semibold text-[#0079bf] hover:bg-[#e9f2ff] disabled:opacity-50"
      >
        {wait > 0 ? `Resend confirmation email (${wait}s)` : "Resend confirmation email"}
      </button>
      {status && <p className="mt-1 text-xs text-gray-600">{status}</p>}
    </div>
  );
}
