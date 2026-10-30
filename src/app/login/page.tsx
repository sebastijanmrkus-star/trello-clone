"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Unsplash photo by Annie Spratt (free to use under the Unsplash License).
const TEAM_PHOTO =
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80";

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
    if (!data.session)
      return setMessage(
        "Check your email to confirm your account, then sign in.",
      );
    router.replace("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen bg-gradient-to-br from-[#0079bf] to-[#5067c5]">
      {/* Team photo: a side panel on wide screens, the backdrop behind the form on phones. */}
      <div
        role="img"
        aria-label="A team collaborating around their laptops"
        className="fixed inset-0 bg-cover bg-center lg:relative lg:inset-auto lg:block lg:flex-1"
        style={{ backgroundImage: `url(${TEAM_PHOTO})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#091e42]/85 via-[#091e42]/40 to-[#0079bf]/30" />
        <div className="absolute bottom-0 left-0 right-0 hidden p-12 text-white lg:block">
          <p className="text-3xl font-bold leading-tight">
            Plan together. Ship together.
          </p>
          <p className="mt-2 max-w-md text-white/85">
            Boards, lists and cards that keep your whole team on the same page.
          </p>
        </div>
      </div>

      <div className="relative flex w-full items-center justify-center p-4 lg:w-[480px] lg:shrink-0 lg:bg-[#f7f8f9]">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-sm space-y-4 rounded-lg bg-white p-8 shadow-xl"
        >
          <div className="flex items-center justify-center gap-2 text-[#0079bf]">
            <span className="grid h-8 w-8 place-items-center rounded bg-[#0079bf] text-white">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="currentColor"
                aria-hidden
              >
                <rect x="4" y="4" width="7" height="14" rx="1.5" />
                <rect x="13" y="4" width="7" height="9" rx="1.5" />
              </svg>
            </span>
            <span className="text-xl font-bold">Trello Clone</span>
          </div>
          <h1 className="text-center text-2xl font-bold">
            {mode === "signin"
              ? "Log in to continue"
              : "Create your account"}
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
            {mode === "signin"
              ? "No account? Sign up"
              : "Already have an account? Log in"}
          </button>
        </form>
      </div>
    </main>
  );
}
