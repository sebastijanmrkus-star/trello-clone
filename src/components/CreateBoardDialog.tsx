"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BACKGROUND_PHOTOS } from "@/lib/templates";
import { BackgroundPicker } from "./BackgroundPicker";
import type { Workspace } from "@/lib/types";
import { CloseIcon, PlusIcon } from "./Icons";

export function CreateBoardButton({ workspaces }: { workspaces: Workspace[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-8 shrink-0 items-center gap-1 rounded bg-[#0c66e4] px-3 text-sm font-medium text-white hover:bg-[#0055cc]"
      >
        <PlusIcon className="h-4 w-4 sm:hidden" />
        <span className="hidden sm:inline">Create</span>
      </button>
      {open && <CreateBoardDialog workspaces={workspaces} onClose={() => setOpen(false)} />}
    </>
  );
}

export function CreateBoardTile({ workspaces, workspaceId }: { workspaces: Workspace[]; workspaceId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-24 items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-700 hover:bg-gray-200"
      >
        Create new board
      </button>
      {open && (
        <CreateBoardDialog workspaces={workspaces} defaultWorkspaceId={workspaceId} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function CreateBoardDialog({
  workspaces,
  defaultWorkspaceId,
  onClose,
}: {
  workspaces: Workspace[];
  defaultWorkspaceId?: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [background, setBackground] = useState(BACKGROUND_PHOTOS[0].background);
  const [workspaceId, setWorkspaceId] = useState(defaultWorkspaceId ?? workspaces[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !workspaceId) return;
    setBusy(true);
    const { data, error } = await createClient()
      .from("boards")
      .insert({ title: title.trim(), background, workspace_id: workspaceId })
      .select("id")
      .single();
    setBusy(false);
    if (error) return setError(error.message);
    onClose();
    router.push(`/b/${data.id}`);
    router.refresh();
  }

  return (
    <div onMouseDown={onClose} className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-20">
      <form
        onSubmit={create}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-lg bg-white p-4 text-gray-800 shadow-2xl"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Create board</h2>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-gray-100" aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <div className="mb-4 flex h-28 items-center justify-center rounded-lg" style={{ background }}>
          <div className="w-3/4 space-y-1.5 rounded bg-white/30 p-2">
            <div className="h-2 w-2/3 rounded bg-white/80" />
            <div className="h-2 w-1/2 rounded bg-white/80" />
          </div>
        </div>

        <div className="mb-4">
          <BackgroundPicker value={background} onChange={setBackground} compact />
        </div>

        <label className="mb-1 block text-xs font-semibold text-gray-600">
          Board title <span className="text-red-600">*</span>
        </label>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          className="mb-3 w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-[#0c66e4]"
        />

        <label className="mb-1 block text-xs font-semibold text-gray-600">Workspace</label>
        <select
          value={workspaceId}
          onChange={(e) => setWorkspaceId(e.target.value)}
          className="mb-4 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
        >
          {workspaces.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>

        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
        <button
          disabled={!title.trim() || busy}
          className="w-full rounded bg-[#0c66e4] py-2 text-sm font-medium text-white hover:bg-[#0055cc] disabled:bg-gray-200 disabled:text-gray-500"
        >
          {busy ? "Creating…" : "Create"}
        </button>
        <Link
          href="/templates"
          onClick={onClose}
          className="mt-2 block w-full rounded bg-gray-100 py-2 text-center text-sm hover:bg-gray-200"
        >
          Start with a template
        </Link>
      </form>
    </div>
  );
}
