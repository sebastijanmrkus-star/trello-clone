"use client";

import { useState } from "react";
import { useBoard } from "./BoardProvider";
import { Popover } from "./Popover";
import { Avatar } from "../Avatar";

export function ShareButton() {
  const { people, isOwner, currentUserId, board, addBoardMember, removeBoardMember } = useBoard();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setError(null);
    const err = await addBoardMember(email.trim());
    setBusy(false);
    if (err) setError(err);
    else setEmail("");
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded bg-white/20 px-2.5 py-1.5 text-sm font-medium hover:bg-white/30"
        aria-expanded={open}
      >
        <span className="flex -space-x-1.5">
          {people.slice(0, 3).map((p) => (
            <span key={p.id} className="rounded-full ring-2 ring-white/40">
              <Avatar email={p.email} size="sm" />
            </span>
          ))}
        </span>
        <span className="hidden sm:inline">Share</span>
      </button>

      {open && (
        <Popover title="Share board" onClose={() => setOpen(false)} align="right" className="w-80">
          {isOwner && (
            <form onSubmit={invite} className="mb-3">
              <label className="mb-1 block text-xs font-semibold text-gray-600">Invite by email</label>
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="min-w-0 flex-1 rounded border border-gray-300 px-2 py-1.5 outline-none focus:border-[#0c66e4]"
                />
                <button
                  disabled={busy || !email.trim()}
                  className="rounded bg-[#0c66e4] px-3 py-1.5 text-white disabled:opacity-50"
                >
                  {busy ? "…" : "Share"}
                </button>
              </div>
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
              <p className="mt-1 text-xs text-gray-500">They need an account here. Members can edit cards and lists.</p>
            </form>
          )}

          <p className="mb-1 text-xs font-semibold text-gray-600">Board members</p>
          <ul className="max-h-64 space-y-1 overflow-y-auto">
            {people.map((p) => {
              const owner = p.id === board.owner_id;
              const me = p.id === currentUserId;
              return (
                <li key={p.id} className="flex items-center gap-2 rounded px-1 py-1">
                  <Avatar email={p.email} />
                  <span className="min-w-0 flex-1 truncate">
                    {p.email}
                    {me && <span className="text-gray-500"> (you)</span>}
                  </span>
                  {owner ? (
                    <span className="text-xs text-gray-500">Owner</span>
                  ) : isOwner ? (
                    <button
                      onClick={() => confirm(`Remove ${p.email} from this board?`) && removeBoardMember(p.id)}
                      className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  ) : me ? (
                    <button
                      onClick={() => confirm("Leave this board? You'll lose access to it.") && removeBoardMember(p.id)}
                      className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                    >
                      Leave board
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </Popover>
      )}
    </div>
  );
}
