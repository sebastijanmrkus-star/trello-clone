"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { authButton } from "@/components/AuthLayout";
import { PasswordField, passwordIsStrong } from "@/components/PasswordField";

export function ResetPasswordForm({ email, demo }: { email: string; demo: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const mismatch = confirm.length > 0 && confirm !== password;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordIsStrong(password) || password !== confirm) return;
    setLoading(true);
    setError(null);
    const { error } = await createClient().auth.updateUser({ password });
    setLoading(false);
    if (error) return setError(error.message);
    router.replace("/?notice=" + encodeURIComponent("Your password has been changed."));
    router.refresh();
  }

  if (demo) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold">Choose a new password</h1>
        <p className="text-sm text-gray-600">Demo accounts share one fixed password, so it can&apos;t be changed.</p>
        <Link href="/" className={`block ${authButton}`}>
          Go to boards
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="text-center text-2xl font-bold">Choose a new password</h1>
      <p className="text-center text-sm text-gray-600">
        For <span className="font-semibold text-gray-900">{email}</span>
      </p>
      <PasswordField value={password} onChange={setPassword} autoComplete="new-password" placeholder="New password" label="New password" checklist />
      <PasswordField value={confirm} onChange={setConfirm} autoComplete="new-password" placeholder="Repeat new password" label="Repeat new password" />
      {mismatch && <p className="text-sm text-red-600">The passwords don&apos;t match.</p>}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <button disabled={loading || !passwordIsStrong(password) || password !== confirm} className={authButton}>
        {loading ? "Saving…" : "Save new password"}
      </button>
    </form>
  );
}
