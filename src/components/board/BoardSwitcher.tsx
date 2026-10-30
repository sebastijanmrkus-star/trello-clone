"use client";

import { useState } from "react";
import Link from "next/link";
import type { Board, Workspace } from "@/lib/types";
import { BoardsIcon, ChevronDownIcon, StarIcon } from "../Icons";
import { Popover } from "./Popover";

export function BoardSwitcher({
  boards,
  workspaces,
  currentId,
  currentUserId,
}: {
  boards: Board[];
  workspaces: Workspace[];
  currentId: string;
  currentUserId: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const match = (b: Board) => b.title.toLowerCase().includes(q.trim().toLowerCase());
  const own = (b: Board) => b.owner_id === currentUserId;
  const starred = boards.filter((b) => own(b) && b.starred && match(b));
  const shared = boards.filter((b) => !own(b) && match(b));

  const row = (b: Board) => (
    <Link
      key={b.id}
      href={`/b/${b.id}`}
      onClick={() => setOpen(false)}
      className={`flex items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-100 ${b.id === currentId ? "bg-[#e9f2ff]" : ""}`}
    >
      <span className="h-6 w-8 shrink-0 rounded" style={{ background: b.background }} />
      <span className="flex-1 truncate">{b.title}</span>
      {own(b) && b.starred && <StarIcon filled className="h-3.5 w-3.5 text-[#f5cd47]" />}
    </Link>
  );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded bg-white/20 px-2.5 py-1.5 text-sm font-medium hover:bg-white/30"
        aria-expanded={open}
      >
        <BoardsIcon /> <span className="hidden sm:inline">Switch board</span>
        <ChevronDownIcon className="h-3.5 w-3.5" />
      </button>
      {open && (
        <Popover title="Switch board" onClose={() => setOpen(false)} className="w-80">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Find a board by name"
            className="mb-2 w-full rounded border border-gray-300 px-2 py-1.5 outline-none focus:border-[#0c66e4]"
          />
          <div className="max-h-96 overflow-y-auto">
            {starred.length > 0 && (
              <>
                <p className="px-2 pb-1 pt-1 text-xs font-semibold uppercase text-gray-500">Starred</p>
                {starred.map(row)}
              </>
            )}
            {workspaces.map((w) => {
              const mine = boards.filter((b) => b.workspace_id === w.id && match(b));
              if (!mine.length) return null;
              return (
                <div key={w.id}>
                  <p className="px-2 pb-1 pt-2 text-xs font-semibold uppercase text-gray-500">{w.name}</p>
                  {mine.map(row)}
                </div>
              );
            })}
            {shared.length > 0 && (
              <>
                <p className="px-2 pb-1 pt-2 text-xs font-semibold uppercase text-gray-500">Shared with you</p>
                {shared.map(row)}
              </>
            )}
            {!boards.some(match) && <p className="px-2 py-2 text-gray-500">No boards found.</p>}
          </div>
        </Popover>
      )}
    </div>
  );
}
