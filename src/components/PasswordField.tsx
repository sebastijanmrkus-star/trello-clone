"use client";

import { useId, useState } from "react";

// Common baseline (OWASP / NIST style): long enough, with a mix of character
// types. Supabase also enforces its own minimum on the server.
export const PASSWORD_RULES: { label: string; test: (pw: string) => boolean }[] = [
  { label: "At least 8 characters", test: (pw) => pw.length >= 8 },
  { label: "An uppercase letter (A–Z)", test: (pw) => /[A-Z]/.test(pw) },
  { label: "A lowercase letter (a–z)", test: (pw) => /[a-z]/.test(pw) },
  { label: "A number (0–9)", test: (pw) => /\d/.test(pw) },
  { label: "A symbol (e.g. ! @ # ?)", test: (pw) => /[^A-Za-z0-9\s]/.test(pw) },
  { label: "No spaces at the start or end", test: (pw) => pw.length > 0 && pw === pw.trim() },
];

export const passwordIsStrong = (pw: string) => PASSWORD_RULES.every((r) => r.test(pw));

export function PasswordField({
  value,
  onChange,
  placeholder = "Password",
  autoComplete,
  checklist = false,
  label = "Password",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete: "current-password" | "new-password";
  checklist?: boolean;
  label?: string;
}) {
  const [show, setShow] = useState(false);
  const id = useId();

  return (
    <div>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          required
          aria-label={label}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={checklist ? `${id}-rules` : undefined}
          className="w-full rounded border border-gray-300 px-3 py-2 pr-16 outline-none focus:border-[#0079bf]"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          aria-controls={id}
          className="absolute inset-y-0 right-0 flex items-center gap-1 px-3 text-xs font-semibold text-[#0079bf] hover:underline"
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
          {show ? "Hide" : "Show"}
        </button>
      </div>
      {checklist && (
        <ul id={`${id}-rules`} className="mt-2 space-y-0.5 text-xs" aria-live="polite">
          {PASSWORD_RULES.map((r) => {
            const ok = r.test(value);
            return (
              <li key={r.label} className={`flex items-center gap-1.5 ${ok ? "text-[#1f845a]" : "text-gray-500"}`}>
                <span
                  aria-hidden
                  className={`grid h-3.5 w-3.5 place-items-center rounded-full text-[9px] font-bold ${
                    ok ? "bg-[#1f845a] text-white" : "border border-gray-400"
                  }`}
                >
                  {ok ? "✓" : ""}
                </span>
                {r.label}
                <span className="sr-only">{ok ? " (done)" : " (missing)"}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path d="M3 3l18 18M10.6 5.1A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.2M6.6 6.6C3.7 8.4 2 12 2 12s3.6 7 10 7a9.9 9.9 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </svg>
);

