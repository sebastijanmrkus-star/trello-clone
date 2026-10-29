import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { BOARD_COLUMNS, type Board, type Workspace } from "@/lib/types";

// Request-scoped helpers so the nav and the page can share one query each.
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getWorkspaces = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workspaces")
    .select("id, name, created_at")
    .order("created_at")
    .returns<Workspace[]>();
  return data ?? [];
});

export const getBoards = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.from("boards").select(BOARD_COLUMNS).order("created_at").returns<Board[]>();
  return data ?? [];
});
