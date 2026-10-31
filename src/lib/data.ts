import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { BOARD_COLUMNS, type Board, type Role, type Team, type Workspace } from "@/lib/types";

// Request-scoped helpers so the nav and the page can share one query each.
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

// Teams as plain workspaces, the current team first (so it is the default
// when creating a board).
export const getWorkspaces = cache(async (): Promise<Workspace[]> => {
  const [teams, current] = await Promise.all([getTeams(), getCurrentTeam()]);
  return [...teams]
    .sort((a, b) => Number(b.id === current?.id) - Number(a.id === current?.id))
    .map(({ id, name, created_at }) => ({ id, name, created_at }));
});

export const getBoards = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.from("boards").select(BOARD_COLUMNS).order("created_at").returns<Board[]>();
  return data ?? [];
});

// Teams you belong to, with your role in each (oldest first).
export const getTeams = cache(async (): Promise<Team[]> => {
  const user = await getUser();
  if (!user) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("workspace_members")
    .select("role, workspaces(id, name, created_at)")
    .eq("user_id", user.id)
    .returns<{ role: Role; workspaces: Workspace | null }[]>();
  return (data ?? [])
    .flatMap((m) => (m.workspaces ? [{ ...m.workspaces, role: m.role }] : []))
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
});

export const TEAM_COOKIE = "team";

// The team picked in the team switcher (remembered in a cookie), else the first.
export const getCurrentTeam = cache(async (): Promise<Team | null> => {
  const teams = await getTeams();
  const picked = (await cookies()).get(TEAM_COOKIE)?.value;
  return teams.find((t) => t.id === picked) ?? teams[0] ?? null;
});
