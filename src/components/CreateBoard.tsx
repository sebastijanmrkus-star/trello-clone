"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const COLORS = ["#0079bf", "#d29034", "#519839", "#b04632", "#89609e", "#cd5a91", "#4bbf6b", "#00aecc"];

export function CreateBoard() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const { data, error } = await createClient()
      .from("boards")
      .insert({ title: title.trim(), color })
      .select("id")
      .single();
    if (error) return alert(error.message);
    router.push(`/b/${data.id}`);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="h-24 rounded-md bg-gray-200 text-sm text-gray-700 hover:bg-gray-300"
      >
        Create new board
      </button>
    );
  }

  return (
    <form onSubmit={create} className="space-y-2 rounded-md bg-white p-3 shadow">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Board title"
        className="w-full rounded border px-2 py-1 text-sm"
      />
      <div className="flex flex-wrap gap-1">
        {COLORS.map((c) => (
          <button
            type="button"
            key={c}
            onClick={() => setColor(c)}
            style={{ background: c }}
            className={`h-5 w-7 rounded ${c === color ? "ring-2 ring-offset-1 ring-gray-700" : ""}`}
            aria-label={`Color ${c}`}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <button className="rounded bg-[#0079bf] px-3 py-1 text-sm text-white">Create</button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-gray-600">
          Cancel
        </button>
      </div>
    </form>
  );
}
