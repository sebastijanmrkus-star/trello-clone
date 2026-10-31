"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { switchTeam } from "@/app/teams/actions";
import type { Team } from "@/lib/types";
import { Popover } from "./board/Popover";
import { WorkspaceAvatar } from "./Sidebar";
import { ChevronDownIcon, PlusIcon, UsersIcon } from "./Icons";

export function TeamSwitcher({ teams, currentId, dark }: { teams: Team[]; currentId?: string; dark?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const current = teams.find((t) => t.id === currentId) ?? teams[0];

  function pick(id: string, to = "/") {
    setOpen(false);
    startTransition(async () => {
      await switchTeam(id);
      router.push(to);
      router.refresh();
    });
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    // The id is made here: the new row can't be read back in the same request,
    // because you become its Admin (and so able to read it) just after insert.
    const id = crypto.randomUUID();
    const { error } = await createClient().from("workspaces").insert({ id, name: name.trim() });
    if (error) return setError(error.message);
    setName("");
    setCreating(false);
    pick(id, `/teams/${id}`);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Switch team"
        className={`flex max-w-[11rem] items-center gap-1.5 rounded px-2 py-1 text-sm font-medium ${
          dark ? "hover:bg-white/20" : "hover:bg-gray-100"
        } ${pending ? "opacity-60" : ""}`}
      >
        {current && <WorkspaceAvatar name={current.name} />}
        <span className="hidden truncate md:inline">{current?.name ?? "Teams"}</span>
        <ChevronDownIcon className="h-3.5 w-3.5 shrink-0" />
      </button>
      {open && (
        <Popover title="Teams" onClose={() => setOpen(false)} className="w-72 text-gray-800">
          <ul className="max-h-72 space-y-0.5 overflow-y-auto">
            {teams.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => pick(t.id)}
                  aria-current={t.id === current?.id}
                  className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-gray-100 ${
                    t.id === current?.id ? "bg-[#e9f2ff]" : ""
                  }`}
                >
                  <WorkspaceAvatar name={t.name} />
                  <span className="min-w-0 flex-1 truncate text-sm">{t.name}</span>
                  <span className="rounded bg-gray-100 px-1.5 text-[11px] text-gray-600">
                    {t.role === "admin" ? "Admin" : "Member"}
                  </span>
                  {t.id === current?.id && <span className="text-[#0c66e4]">✓</span>}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-2 space-y-0.5 border-t border-gray-200 pt-2">
            {current && (
              <Link
                href={`/teams/${current.id}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-100"
              >
                <UsersIcon /> {current.role === "admin" ? "Manage team" : "Team members"}
              </Link>
            )}
            {creating ? (
              <form onSubmit={create} className="space-y-2 px-1 pt-1">
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Team name"
                  maxLength={100}
                  aria-label="Team name"
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-[#0c66e4]"
                />
                {error && <p className="text-xs text-red-600">{error}</p>}
                <div className="flex gap-2">
                  <button disabled={!name.trim()} className="rounded bg-[#0c66e4] px-3 py-1.5 text-sm text-white disabled:opacity-50">
                    Create team
                  </button>
                  <button type="button" onClick={() => setCreating(false)} className="rounded px-3 py-1.5 text-sm hover:bg-gray-100">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-gray-100"
              >
                <PlusIcon /> Create a team
              </button>
            )}
          </div>
        </Popover>
      )}
    </div>
  );
}
