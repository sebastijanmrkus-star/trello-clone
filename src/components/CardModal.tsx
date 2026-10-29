"use client";

import { useEffect, useState } from "react";
import type { Card } from "@/lib/types";

export function CardModal({
  card,
  listTitle,
  onClose,
  onUpdate,
  onDelete,
}: {
  card: Card;
  listTitle: string;
  onClose: () => void;
  onUpdate: (patch: Partial<Pick<Card, "title" | "description">>) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function saveTitle() {
    const t = title.trim();
    if (t && t !== card.title) onUpdate({ title: t });
    else setTitle(card.title);
  }

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-16">
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xl rounded-lg bg-[#f4f5f7] p-6 shadow-2xl">
        <div className="flex items-start gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            className="flex-1 rounded bg-transparent px-1 text-xl font-semibold outline-none focus:bg-white"
          />
          <button onClick={onClose} className="text-2xl leading-none text-gray-500" aria-label="Close">
            ×
          </button>
        </div>
        <p className="mb-4 px-1 text-sm text-gray-500">in list {listTitle}</p>

        <h3 className="mb-2 font-semibold">Description</h3>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          placeholder="Add a more detailed description…"
          className="w-full rounded border border-gray-300 bg-white p-2 text-sm outline-none focus:border-[#0079bf]"
        />
        <div className="mt-3 flex justify-between">
          <button
            onClick={() => onUpdate({ description })}
            disabled={description === card.description}
            className="rounded bg-[#0079bf] px-4 py-1.5 text-sm text-white disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={() => confirm("Delete this card?") && onDelete()}
            className="rounded bg-red-600 px-4 py-1.5 text-sm text-white hover:bg-red-700"
          >
            Delete card
          </button>
        </div>
      </div>
    </div>
  );
}
