"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Board, Workspace } from "@/lib/types";
import { WorkspaceAvatar } from "../Sidebar";
import { BoardsIcon, ChevronLeftIcon, ChevronRightIcon, StarIcon } from "../Icons";

const KEY = "boardSidebarCollapsed";

// Collapsible left panel on the board page for jumping between boards.
export function BoardSidebar({
  boards,
  workspace,
  currentId,
  currentUserId,
}: {
  boards: Board[];
  workspace?: Workspace;
  currentId: string;
  currentUserId: string;
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(KEY) === "1");
    } catch {}
  }, []);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(KEY, next ? "1" : "0");
    } catch {}
  }

  if (collapsed) {
    return (
      <div className="hidden w-4 shrink-0 bg-black/30 md:block">
        <button
          onClick={toggle}
          className="ml-1 mt-3 grid h-7 w-7 place-items-center rounded-full border border-white/30 bg-[#1d2125]/80 text-white hover:bg-[#1d2125]"
          aria-label="Expand sidebar"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const mine = boards.filter((b) => b.workspace_id === workspace?.id);
  const shared = boards.filter((b) => b.owner_id !== currentUserId);
  const row = (b: Board) => (
    <Link
      key={b.id}
      href={`/b/${b.id}`}
      className={`flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-white/20 ${
        b.id === currentId ? "bg-white/25 font-semibold" : ""
      }`}
    >
      <span className="h-4 w-6 shrink-0 rounded-sm ring-1 ring-white/30" style={{ background: b.background }} />
      <span className="flex-1 truncate">{b.title}</span>
      {b.starred && b.owner_id === currentUserId && <StarIcon filled className="h-3.5 w-3.5 text-[#f5cd47]" />}
    </Link>
  );
  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-black/40 text-white backdrop-blur md:flex">
      <div className="flex items-center gap-2 border-b border-white/15 px-3 py-3">
        {workspace && <WorkspaceAvatar name={workspace.name} />}
        <span className="flex-1 truncate text-sm font-semibold">{workspace?.name}</span>
        <button onClick={toggle} className="rounded p-1 hover:bg-white/20" aria-label="Collapse sidebar">
          <ChevronLeftIcon />
        </button>
      </div>
      <Link href="/" className="mx-2 mt-2 flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-white/20">
        <BoardsIcon /> All boards
      </Link>
      <nav className="flex-1 overflow-y-auto px-2 pb-3">
        <p className="px-2 pb-1 pt-4 text-xs font-semibold text-white/80">Your boards</p>
        {mine.map(row)}
        {shared.length > 0 && (
          <>
            <p className="px-2 pb-1 pt-4 text-xs font-semibold text-white/80">Shared with you</p>
            {shared.map(row)}
          </>
        )}
      </nav>
    </aside>
  );
}
