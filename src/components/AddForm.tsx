"use client";

import { useState } from "react";

export function AddForm({
  label,
  placeholder,
  onAdd,
  multiline,
  light,
}: {
  label: string;
  placeholder: string;
  onAdd: (title: string) => Promise<void> | void;
  multiline?: boolean;
  light?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  async function submit() {
    const v = value.trim();
    if (!v) return;
    setValue("");
    await onAdd(v);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={`w-full rounded px-2 py-1.5 text-left text-sm ${
          light ? "text-white hover:bg-white/20" : "text-gray-600 hover:bg-gray-300"
        }`}
      >
        {label}
      </button>
    );
  }

  const shared = {
    autoFocus: true,
    value,
    placeholder,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue(e.target.value),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
      if (e.key === "Escape") setOpen(false);
    },
    className: "w-full rounded border-0 px-2 py-1.5 text-sm text-gray-900 shadow-sm outline-none",
  };

  return (
    <div className="space-y-2 rounded bg-[#ebecf0] p-1">
      {multiline ? <textarea rows={3} {...shared} /> : <input {...shared} />}
      <div className="flex items-center gap-2">
        <button onClick={submit} className="rounded bg-[#0079bf] px-3 py-1 text-sm text-white hover:bg-[#026aa7]">
          Add
        </button>
        <button onClick={() => setOpen(false)} className="px-2 text-xl text-gray-600" aria-label="Cancel">
          ×
        </button>
      </div>
    </div>
  );
}
