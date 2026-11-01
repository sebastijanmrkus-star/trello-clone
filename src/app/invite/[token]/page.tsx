import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/data";
import { AuthLayout } from "@/components/AuthLayout";
import type { InvitationStatus, Role } from "@/lib/types";
import { AcceptInvitation } from "./AcceptInvitation";

type Preview = {
  team_id: string;
  team_name: string;
  role: Role;
  invited_by: string | null;
  status: InvitationStatus;
  expires_at: string;
  already_member: boolean;
};

const PROBLEMS: Record<Exclude<InvitationStatus, "pending">, string> = {
  accepted: "This invitation link has already been used. Each link works once; ask a team Admin for a new one.",
  expired: "This invitation link has expired. Ask a team Admin for a new one.",
  revoked: "This invitation was revoked by a team Admin.",
};

// Signed-out visitors are sent to log in (or sign up) first and come back here.
export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const [user, { data }] = await Promise.all([
    getUser(),
    supabase.rpc("get_invitation", { p_token: token }),
  ]);
  const inv = (data as Preview[] | null)?.[0];

  return (
    <AuthLayout>
      {!inv ? (
        <Problem title="Invitation not found" text="This invitation link is not valid. Check that you copied all of it." />
      ) : inv.already_member ? (
        <Problem title={`You're already in ${inv.team_name}`} text="No need to use this link." teamId={inv.team_id} />
      ) : inv.status !== "pending" ? (
        <Problem title="This link can't be used" text={PROBLEMS[inv.status]} />
      ) : (
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold">Join {inv.team_name}</h1>
          <p className="text-sm text-gray-600">
            {inv.invited_by ?? "A team Admin"} invited you to join as{" "}
            <span className="font-semibold text-gray-900">{inv.role === "admin" ? "an Admin" : "a Member"}</span>.
          </p>
          <p className="text-xs text-gray-500">
            Signed in as {user?.email}. The link expires{" "}
            {new Date(inv.expires_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })} and works
            once.
          </p>
          <AcceptInvitation token={token} />
          <form action="/auth/signout" method="post">
            <input type="hidden" name="next" value={`/invite/${token}`} />
            <button className="text-sm text-[#0079bf] hover:underline">Not you? Log out</button>
          </form>
        </div>
      )}
    </AuthLayout>
  );
}

function Problem({ title, text, teamId }: { title: string; text: string; teamId?: string }) {
  return (
    <div className="space-y-4 text-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-sm text-gray-600">{text}</p>
      <Link
        href={teamId ? `/teams/${teamId}` : "/"}
        className="block w-full rounded bg-[#0079bf] py-2 font-semibold text-white hover:bg-[#026aa7]"
      >
        {teamId ? "Open team" : "Go to boards"}
      </Link>
    </div>
  );
}
