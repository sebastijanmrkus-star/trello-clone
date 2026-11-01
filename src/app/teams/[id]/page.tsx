import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/data";
import { AppShell } from "@/components/AppShell";
import type { Role, TeamMember, Workspace } from "@/lib/types";
import { TeamSettings } from "./TeamSettings";

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const user = await getUser();

  const [{ data: team }, { data: memberRows }] = await Promise.all([
    supabase.from("workspaces").select("id, name, created_at").eq("id", id).maybeSingle<Workspace>(),
    supabase
      .from("workspace_members")
      .select("user_id, role, joined_at, profiles(email)")
      .eq("workspace_id", id)
      .order("joined_at")
      .returns<{ user_id: string; role: Role; joined_at: string; profiles: { email: string } | null }[]>(),
  ]);
  if (!team) notFound();

  const members: TeamMember[] = (memberRows ?? []).map((m) => ({
    user_id: m.user_id,
    role: m.role,
    joined_at: m.joined_at,
    email: m.profiles?.email ?? "Former member",
  }));
  const myRole = members.find((m) => m.user_id === user?.id)?.role ?? "member";

  return (
    <AppShell>
      <TeamSettings
        team={team}
        members={members}
        myRole={myRole}
        currentUserId={user?.id ?? ""}
      />
    </AppShell>
  );
}
