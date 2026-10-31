"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { isDemoEmail } from "@/lib/demo";

export function UserMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initials = email.slice(0, 2).toUpperCase();

  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="grid h-8 w-8 place-items-center rounded-full bg-[#1f845a] text-xs font-bold text-white"
        aria-label="Account"
      >
        {initials}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-lg border border-gray-200 bg-white p-2 text-sm text-gray-800 shadow-lg">
          <p className="px-2 py-1 text-xs font-semibold uppercase text-gray-500">Account</p>
          <p className="truncate px-2 pb-2">{email}</p>
          {isDemoEmail(email) && (
            <p className="mx-2 mb-2 rounded bg-[#fff7d6] px-2 py-1 text-xs text-[#7f5f01]">
              Demo account: fictional person, shared sample data.
            </p>
          )}
          {!isDemoEmail(email) && (
            <Link
              href="/reset-password"
              onClick={() => setOpen(false)}
              className="block rounded px-2 py-1.5 hover:bg-gray-100"
            >
              Change password
            </Link>
          )}
          <form action="/auth/signout" method="post" className="border-t border-gray-200 pt-1">
            <button className="w-full rounded px-2 py-1.5 text-left hover:bg-gray-100">Log out</button>
          </form>
        </div>
      )}
    </div>
  );
}
