"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { invitationStatus, type Invitation, type InvitationStatus, type Role, type TeamMember, type Workspace } from "@/lib/types";
import { InlineEdit } from "@/components/InlineEdit";
import { Avatar } from "@/components/Avatar";
import { WorkspaceAvatar } from "@/components/Sidebar";
import { CopyIcon, TrashIcon } from "@/components/Icons";

const EXPIRY_OPTIONS: [string, number][] = [
  ["1 day", 1],
  ["7 days", 7],
  ["30 days", 30],
];

const STATUS_STYLES: Record<InvitationStatus, string> = {
  pending: "bg-[#e9f2ff] text-[#0055cc]",
  accepted: "bg-[#dcfff1] text-[#164b35]",
  expired: "bg-gray-100 text-gray-600",
  revoked: "bg-[#ffeceb] text-[#ae2e24]",
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export function TeamSettings({
  team,
  members,
  invitations,
  emails,
  myRole,
  currentUserId,
}: {
  team: Workspace;
  members: TeamMember[];
  invitations: Invitation[];
  emails: Record<string, string>;
  myRole: Role;
  currentUserId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const admin = myRole === "admin";
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [role, setRole] = useState<Role>("member");
  const [days, setDays] = useState(7);
  const [newLink, setNewLink] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
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

  const linkFor = (token: string) => `${location.origin}/invite/${token}`;

  async function copy(token: string) {
    await navigator.clipboard?.writeText(linkFor(token)).catch(() => {});
    setCopied(token);
    setTimeout(() => setCopied((c) => (c === token ? null : c)), 2000);
  }

  async function createInvite(e: React.FormEvent) {
    e.preventDefault();
    setBusy("invite");
    setError(null);
    const expires_at = new Date(Date.now() + days * 86400000).toISOString();
    const { data, error } = await supabase
      .from("team_invitations")
      .insert({ workspace_id: team.id, role, expires_at })
      .select("token")
      .single<{ token: string }>();
    setBusy(null);
    if (error) return setError(error.message);
    setNewLink(data.token);
    copy(data.token);
    router.refresh();
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
          Everyone in the team can open and edit its boards. Admins also manage members, roles, invitations and team
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
          <h2 className="mb-1 text-lg font-semibold">Invitation links</h2>
          <p className="mb-3 text-sm text-gray-600">
            Each link lets one person join, then stops working. Links expire, and you can revoke one any time before
            it&apos;s used.
          </p>
          <form onSubmit={createInvite} className="mb-4 flex flex-wrap items-end gap-3 rounded-lg bg-gray-50 p-4">
            <label className="text-sm">
              <span className="mb-1 block text-xs font-semibold text-gray-600">Joins as</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="rounded border border-gray-300 bg-white px-2 py-1.5"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-semibold text-gray-600">Expires after</span>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="rounded border border-gray-300 bg-white px-2 py-1.5"
              >
                {EXPIRY_OPTIONS.map(([label, d]) => (
                  <option key={d} value={d}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <button
              disabled={busy !== null}
              className="rounded bg-[#0c66e4] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#0055cc] disabled:opacity-50"
            >
              Create invitation link
            </button>
            {newLink && (
              <div className="w-full">
                <p className="mb-1 text-xs font-semibold text-gray-600">
                  New link {copied === newLink ? "(copied to clipboard)" : ""}
                </p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    aria-label="New invitation link"
                    value={linkFor(newLink)}
                    onFocus={(e) => e.target.select()}
                    className="min-w-0 flex-1 rounded border border-gray-300 bg-white px-2 py-1.5 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => copy(newLink)}
                    className="flex items-center gap-1 rounded bg-white px-3 py-1.5 text-sm ring-1 ring-gray-300 hover:bg-gray-100"
                  >
                    <CopyIcon /> Copy
                  </button>
                </div>
              </div>
            )}
          </form>

          {invitations.length === 0 ? (
            <p className="text-sm text-gray-500">No invitations yet.</p>
          ) : (
            <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200">
              {invitations.map((inv) => {
                const status = invitationStatus(inv);
                return (
                  <li key={inv.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm" data-invite-status={status}>
                    <span className={`rounded px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[status]}`}>
                      {status}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p>
                        Joins as <span className="font-medium">{inv.role === "admin" ? "Admin" : "Member"}</span>
                        {status === "accepted" && (
                          <>
                            {" "}
                            · used by {inv.accepted_by ? (emails[inv.accepted_by] ?? "a former member") : "a deleted account"}
                          </>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        Created {fmt(inv.created_at)} by {emails[inv.created_by] ?? "a former member"} ·{" "}
                        {status === "accepted" && inv.accepted_at
                          ? `used ${fmt(inv.accepted_at)}`
                          : status === "revoked" && inv.revoked_at
                            ? `revoked ${fmt(inv.revoked_at)}`
                            : `${status === "expired" ? "expired" : "expires"} ${fmt(inv.expires_at)}`}
                      </p>
                    </div>
                    {status === "pending" && (
                      <>
                        <button
                          onClick={() => copy(inv.token)}
                          className="flex items-center gap-1 rounded px-2 py-1 hover:bg-gray-100"
                        >
                          <CopyIcon /> {copied === inv.token ? "Copied" : "Copy link"}
                        </button>
                        <button
                          onClick={() =>
                            confirm("Revoke this invitation? The link will stop working.") &&
                            run(`revoke-${inv.id}`, () => supabase.rpc("revoke_invitation", { p_id: inv.id }))
                          }
                          disabled={busy !== null}
                          className="rounded px-2 py-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          Revoke
                        </button>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
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
