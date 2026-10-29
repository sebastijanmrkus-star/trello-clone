"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Board, Workspace } from "@/lib/types";
import { BoardsIcon, ChevronDownIcon, TemplateIcon } from "./Icons";

export function Sidebar({ workspaces, boards }: { workspaces: Workspace[]; boards: Board[] }) {
  const pathname = usePathname();
  const item = (href: string, label: string, icon: React.ReactNode) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
          active ? "bg-[#e9f2ff] text-[#0c66e4]" : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        {icon}
        {label}
      </Link>
    );
  };

  return (
    <aside className="hidden w-64 shrink-0 md:block">
      <nav className="sticky top-16 space-y-1">
        {item("/", "Boards", <BoardsIcon />)}
        {item("/templates", "Templates", <TemplateIcon />)}
        <div className="!my-3 border-t border-gray-200" />
        <p className="px-3 pb-1 text-xs font-semibold text-gray-500">Workspaces</p>
        {workspaces.map((w) => (
          <WorkspaceItem key={w.id} workspace={w} boards={boards.filter((b) => b.workspace_id === w.id)} />
        ))}
      </nav>
    </aside>
  );
}

function WorkspaceItem({ workspace, boards }: { workspace: Workspace; boards: Board[] }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
      >
        <WorkspaceAvatar name={workspace.name} />
        <span className="flex-1 truncate text-left">{workspace.name}</span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && (
        <div className="ml-6 space-y-0.5 py-1">
          {boards.length === 0 && <p className="px-3 py-1 text-xs text-gray-500">No boards yet</p>}
          {boards.map((b) => (
            <Link
              key={b.id}
              href={`/b/${b.id}`}
              className="flex items-center gap-2 rounded px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
            >
              <span className="h-4 w-5 shrink-0 rounded-sm" style={{ background: b.background }} />
              <span className="truncate">{b.title}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function WorkspaceAvatar({ name, size = "sm" }: { name: string; size?: "sm" | "lg" }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded bg-gradient-to-b from-[#4bce97] to-[#1f845a] font-bold text-white ${
        size === "lg" ? "h-8 w-8 text-base" : "h-6 w-6 text-xs"
      }`}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
