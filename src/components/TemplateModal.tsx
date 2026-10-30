"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { categoryName, type Template } from "@/lib/templates";
import type { Workspace } from "@/lib/types";
import { CloseIcon } from "./Icons";

export function TemplateModal({
  template,
  workspaces,
  onClose,
}: {
  template: Template;
  workspaces: Workspace[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(template.title);
  const [workspaceId, setWorkspaceId] = useState(workspaces[0]?.id ?? "");
  const [withContent, setWithContent] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function use(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !workspaceId) return;
    setBusy(true);
    const { data, error } = await createClient().rpc("create_board_from_template", {
      p_title: title.trim(),
      p_background: template.background,
      p_workspace_id: workspaceId,
      p_lists: withContent ? template.lists : [],
    });
    if (error) {
      setBusy(false);
      return setError(error.message);
    }
    router.push(`/b/${data}`);
    router.refresh();
  }

  return (
    <div onMouseDown={onClose} className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-16">
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-3xl overflow-hidden rounded-xl bg-white text-gray-800 shadow-2xl"
      >
        <div className="relative p-4" style={{ background: template.background }}>
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded bg-black/30 p-1 text-white hover:bg-black/50"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
          {!withContent && (
            <p className="mt-6 inline-block rounded bg-black/40 px-3 py-2 text-sm font-medium text-white">
              Empty board — only the background is used
            </p>
          )}
          <div className={`flex gap-2 overflow-x-auto pb-1 pt-6 ${withContent ? "" : "hidden"}`}>
            {template.lists.map((l) => (
              <div key={l.title} className="w-40 shrink-0 rounded-lg bg-[#f1f2f4] p-2 text-xs">
                <p className="mb-1.5 font-semibold">{l.title}</p>
                {l.cards.map((c) => (
                  <p key={c} className="mb-1 rounded bg-white px-2 py-1 shadow-sm">
                    {c}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={use} className="grid gap-4 p-5 sm:grid-cols-[1fr_260px]">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">{categoryName(template.category)}</p>
            <h2 className="text-xl font-bold">{template.title}</h2>
            <p className="mt-1 text-sm text-gray-600">{template.description}</p>
            <p className="mt-2 text-xs text-gray-500">
              {withContent
                ? `${template.lists.length} lists · ${template.lists.reduce((n, l) => n + l.cards.length, 0)} starter cards`
                : "Starts empty"}
            </p>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-600">Board title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-[#0c66e4]"
            />
            <label className="block text-xs font-semibold text-gray-600">Workspace</label>
            <select
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
            >
              {workspaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
            <label className="flex cursor-pointer items-center justify-between gap-3 py-1 text-sm">
              Use suggested lists and cards
              <button
                type="button"
                role="switch"
                aria-checked={withContent}
                onClick={() => setWithContent((v) => !v)}
                className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                  withContent ? "bg-[#0c66e4]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                    withContent ? "left-[18px]" : "left-0.5"
                  }`}
                />
              </button>
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              disabled={!title.trim() || busy}
              className="w-full rounded bg-[#0c66e4] py-2 text-sm font-medium text-white hover:bg-[#0055cc] disabled:opacity-50"
            >
              {busy ? "Creating…" : "Use template"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
