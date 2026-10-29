"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TEMPLATES, categoryName } from "@/lib/templates";
import type { Board } from "@/lib/types";
import { SearchIcon } from "./Icons";

type Hit = Pick<Board, "id" | "title" | "background">;

export function SearchBox({ dark }: { dark?: boolean }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [boards, setBoards] = useState<Hit[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const q = query.trim();
  const templates = q
    ? TEMPLATES.filter((t) => t.title.toLowerCase().includes(q.toLowerCase())).slice(0, 4)
    : [];

  useEffect(() => {
    if (!q) return setBoards([]);
    const escaped = q.replace(/[\\%_]/g, (m) => `\\${m}`);
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("boards")
        .select("id, title, background")
        .ilike("title", `%${escaped}%`)
        .order("title")
        .limit(8);
      setBoards(data ?? []);
    }, 200);
    return () => clearTimeout(timer);
  }, [q, supabase]);

  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <div ref={ref} className="relative w-full max-w-xl">
      <SearchIcon
        className={`pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 ${dark ? "text-white/80" : "text-gray-500"}`}
      />
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
          if (e.key === "Enter" && boards[0]) go(`/b/${boards[0].id}`);
        }}
        placeholder="Search boards"
        aria-label="Search boards"
        className={`h-8 w-full rounded border pl-8 pr-2 text-sm outline-none ${
          dark
            ? "border-white/30 bg-white/20 text-white placeholder:text-white/80 focus:bg-white focus:text-gray-900 focus:placeholder:text-gray-500"
            : "border-gray-300 bg-white focus:border-[#0c66e4] focus:ring-1 focus:ring-[#0c66e4]"
        }`}
      />

      {open && q && (
        <div className="absolute left-0 right-0 top-10 z-50 max-h-[70vh] overflow-y-auto rounded-lg border border-gray-200 bg-white p-2 text-sm text-gray-800 shadow-xl">
          <p className="px-2 py-1 text-xs font-semibold uppercase text-gray-500">Boards</p>
          {boards.length === 0 && <p className="px-2 py-2 text-gray-500">No boards match “{q}”.</p>}
          {boards.map((b) => (
            <button
              key={b.id}
              onClick={() => go(`/b/${b.id}`)}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-gray-100"
            >
              <span className="h-6 w-8 shrink-0 rounded" style={{ background: b.background }} />
              <span className="truncate">{b.title}</span>
            </button>
          ))}

          {templates.length > 0 && (
            <>
              <p className="mt-2 px-2 py-1 text-xs font-semibold uppercase text-gray-500">Templates</p>
              {templates.map((t) => (
                <Link
                  key={t.id}
                  href={`/templates?category=${t.category}&template=${t.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-100"
                >
                  <span className="h-6 w-8 shrink-0 rounded" style={{ background: t.background }} />
                  <span className="truncate">{t.title}</span>
                  <span className="ml-auto shrink-0 text-xs text-gray-500">{categoryName(t.category)}</span>
                </Link>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
