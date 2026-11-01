"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Role, TeamMember, Workspace } from "@/lib/types";
import { InlineEdit } from "@/components/InlineEdit";
import { Avatar } from "@/components/Avatar";
import { WorkspaceAvatar } from "@/components/Sidebar";
import { TrashIcon } from "@/components/Icons";

const fmt = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export function TeamSettings({
  team,
  members,
  myRole,
  currentUserId,
}: {
  team: Workspace;
  members: TeamMember[];
  myRole: Role;
  currentUserId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const admin = myRole === "admin";
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("member");
  const [added, setAdded] = useState<string | null>(null);
  const adminCount = members.filter((m) => m.role === "admin").length;

  // Runs a change, shows any error (like the last-Admin rule), then reloads the data.
  async function run(key: string, fn: () => PromiseLike<{ error: { message: string } | null }>) {
    setBusy(key);
    setError(null);
    const { error } = await fn();
    setBusy(null);
    if (error) {
      setError(error.message);
      return false;
    }
    router.refresh();
    return true;
  }

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    const who = email.trim();
    if (!who) return;
    setAdded(null);
    const ok = await run("add", () => supabase.rpc("add_team_member", { p_team_id: team.id, p_email: who, p_role: role }));
    if (ok) {
      setAdded(who);
      setEmail("");
    }
  }

  async function leave() {
    if (!confirm(`Leave ${team.name}? You'll lose access to its boards.`)) return;
    const ok = await run("leave", () =>
      supabase.from("workspace_members").delete().eq("workspace_id", team.id).eq("user_id", currentUserId),
    );
    if (ok) router.push("/");
  }

  async function deleteTeam() {
    if (!confirm(`Delete ${team.name} and all of its boards for everyone? This can't be undone.`)) return;
    const ok = await run("delete", () => supabase.from("workspaces").delete().eq("id", team.id));
    if (ok) router.push("/");
  }

  return (
    <div className="max-w-3xl space-y-10">
      <header className="flex flex-wrap items-center gap-3">
        <WorkspaceAvatar name={team.name} size="lg" />
        {admin ? (
          <InlineEdit
            value={team.name}
            onSave={(name) => run("rename", () => supabase.from("workspaces").update({ name }).eq("id", team.id))}
            className="rounded px-1 text-2xl font-bold hover:bg-gray-100"
            inputClassName="rounded border border-gray-300 px-1 text-2xl font-bold"
          />
        ) : (
          <h1 className="text-2xl font-bold">{team.name}</h1>
        )}
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
          You&apos;re {admin ? "an Admin" : "a Member"}
        </span>
      </header>

      {error && (
        <p role="alert" className="rounded bg-[#ffeceb] px-3 py-2 text-sm text-[#ae2e24]">
          {error}
        </p>
      )}

      <section>
        <h2 className="mb-1 text-lg font-semibold">Members ({members.length})</h2>
        <p className="mb-3 text-sm text-gray-600">
          Everyone in the team can open and edit its boards. Admins also add and remove members, change roles and manage team
          settings. A team always keeps at least one Admin.
        </p>
        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200">
          {members.map((m) => {
            const me = m.user_id === currentUserId;
            const lastAdmin = m.role === "admin" && adminCount === 1;
            return (
              <li key={m.user_id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <Avatar email={m.email} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {m.email}
                    {me && <span className="text-gray-500"> (you)</span>}
                  </p>
                  <p className="text-xs text-gray-500">Joined {fmt(m.joined_at)}</p>
                </div>
                {admin ? (
                  <select
                    aria-label={`Role for ${m.email}`}
                    value={m.role}
                    disabled={busy !== null}
                    title={lastAdmin ? "The last Admin can't be changed to Member" : undefined}
                    onChange={(e) =>
                      run(`role-${m.user_id}`, () =>
                        supabase
                          .from("workspace_members")
                          .update({ role: e.target.value })
                          .eq("workspace_id", team.id)
                          .eq("user_id", m.user_id),
                      )
                    }
                    className="rounded border border-gray-300 bg-white px-2 py-1 text-sm"
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                  </select>
                ) : (
                  <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                    {m.role === "admin" ? "Admin" : "Member"}
                  </span>
                )}
                {me ? (
                  <button
                    onClick={leave}
                    disabled={busy !== null}
                    className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    Leave team
                  </button>
                ) : (
                  admin && (
                    <button
                      onClick={() =>
                        confirm(`Remove ${m.email} from ${team.name}?`) &&
                        run(`remove-${m.user_id}`, () =>
                          supabase.from("workspace_members").delete().eq("workspace_id", team.id).eq("user_id", m.user_id),
                        )
                      }
                      disabled={busy !== null}
                      className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {admin && (
        <section>
          <h2 className="mb-1 text-lg font-semibold">Add a member</h2>
          <p className="mb-3 text-sm text-gray-600">
            Add someone who already has an account here, using the email they signed up with.
          </p>
          <form onSubmit={addMember} className="flex flex-wrap items-end gap-3 rounded-lg bg-gray-50 p-4">
            <label className="min-w-[14rem] flex-1 text-sm">
              <span className="mb-1 block text-xs font-semibold text-gray-600">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 outline-none focus:border-[#0c66e4]"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-semibold text-gray-600">Role</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="rounded border border-gray-300 bg-white px-2 py-1.5"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <button
              disabled={busy !== null || !email.trim()}
              className="rounded bg-[#0c66e4] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#0055cc] disabled:opacity-50"
            >
              {busy === "add" ? "Adding…" : "Add to team"}
            </button>
          </form>
          {added && (
            <p role="status" className="mt-2 text-sm text-[#1f845a]">
              {added} was added to {team.name}.
            </p>
          )}
        </section>
      )}

      {admin && (
        <section className="rounded-lg border border-red-200 p-4">
          <h2 className="mb-1 font-semibold text-red-700">Delete team</h2>
          <p className="mb-3 text-sm text-gray-600">Deletes the team and every board in it for all members.</p>
          <button
            onClick={deleteTeam}
            disabled={busy !== null}
            className="flex items-center gap-2 rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            <TrashIcon /> Delete {team.name}
          </button>
        </section>
      )}
    </div>
  );
}
