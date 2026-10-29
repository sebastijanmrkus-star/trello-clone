"use client";

import { useState } from "react";
import { LABEL_COLORS, type Label } from "@/lib/types";

// Create or edit a label: name + color swatch grid.
export function LabelEditor({
  label,
  onSave,
  onDelete,
  onCancel,
}: {
  label?: Label;
  onSave: (name: string, color: string) => void;
  onDelete?: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(label?.name ?? "");
  const [color, setColor] = useState(label?.color ?? "green");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(name.trim(), color);
      }}
    >
      <div className="mb-3 rounded bg-gray-100 p-4">
        <span
          className="flex h-8 items-center rounded px-3 text-sm font-semibold text-gray-900"
          style={{ background: LABEL_COLORS[color] }}
        >
          {name}
        </span>
      </div>
      <label className="mb-1 block text-xs font-semibold text-gray-600">Title</label>
      <input
        autoFocus
        value={name}
        maxLength={50}
        onChange={(e) => setName(e.target.value)}
        className="mb-3 w-full rounded border border-gray-300 px-2 py-1.5 outline-none focus:border-[#0c66e4]"
      />
      <p className="mb-1 text-xs font-semibold text-gray-600">Select a color</p>
      <div className="mb-3 grid grid-cols-5 gap-1.5">
        {Object.entries(LABEL_COLORS).map(([key, hex]) => (
          <button
            type="button"
            key={key}
            onClick={() => setColor(key)}
            style={{ background: hex }}
            aria-label={key}
            className={`h-8 rounded ${color === key ? "ring-2 ring-[#0c66e4] ring-offset-1" : ""}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button className="rounded bg-[#0c66e4] px-3 py-1.5 text-white">{label ? "Save" : "Create"}</button>
          <button type="button" onClick={onCancel} className="rounded px-3 py-1.5 hover:bg-gray-100">
            Back
          </button>
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={() => confirm("Delete this label? It will be removed from all cards.") && onDelete()}
            className="rounded bg-red-600 px-3 py-1.5 text-white"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
