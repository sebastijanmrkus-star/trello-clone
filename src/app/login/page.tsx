"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const supabase = createClient();
    const { data, error } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${location.origin}/` },
          });
    setLoading(false);
    if (error) return setMessage(error.message);
    if (!data.session) return setMessage("Check your email to confirm your account, then sign in.");
    router.replace("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0079bf] to-[#5067c5] p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-lg bg-white p-8 shadow-xl">
        <h1 className="text-center text-2xl font-bold">
          {mode === "signin" ? "Log in to Trello Clone" : "Create your account"}
        </h1>
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-[#0079bf]"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-[#0079bf]"
        />
        {message && <p className="text-sm text-red-600">{message}</p>}
        <button
          disabled={loading}
          className="w-full rounded bg-[#0079bf] py-2 font-semibold text-white hover:bg-[#026aa7] disabled:opacity-60"
        >
          {loading ? "…" : mode === "signin" ? "Log in" : "Sign up"}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="w-full text-sm text-[#0079bf] hover:underline"
        >
          {mode === "signin" ? "No account? Sign up" : "Already have an account? Log in"}
        </button>
      </form>
    </main>
  );
}
