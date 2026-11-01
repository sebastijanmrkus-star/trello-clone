import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBoards, getUser, getWorkspaces } from "@/lib/data";
import { TopNav } from "@/components/TopNav";
import { BoardView } from "@/components/board/BoardView";
import { RefreshIfStale } from "@/components/RefreshIfStale";
import {
  BOARD_COLUMNS,
  CARD_COLUMNS,
  LIST_COLUMNS,
  type Board,
  type Card,
  type CardMember,
  type Profile,
  type Role,
  type CardLabel,
  type Checklist,
  type ChecklistItem,
  type Label,
  type List,
} from "@/lib/types";

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: board },
    { data: lists },
    { data: cards },
    { data: labels },
    { data: cardLabels },
    { data: checklists },
    { data: items },
    { data: commentRows },
    { data: memberRows },
    { data: cardMembers },
    allBoards,
    workspaces,
    user,
  ] = await Promise.all([
    supabase.from("boards").select(BOARD_COLUMNS).eq("id", id).maybeSingle<Board>(),
    supabase.from("lists").select(LIST_COLUMNS).eq("board_id", id).order("position").returns<List[]>(),
    supabase.from("cards").select(CARD_COLUMNS).eq("board_id", id).order("position").returns<Card[]>(),
    supabase.from("labels").select("id, board_id, name, color").eq("board_id", id).order("created_at").returns<Label[]>(),
    supabase.from("card_labels").select("card_id, label_id").eq("board_id", id).returns<CardLabel[]>(),
    supabase.from("checklists").select("id, card_id, title, position").eq("board_id", id).returns<Checklist[]>(),
    supabase
      .from("checklist_items")
      .select("id, checklist_id, title, done, position")
      .eq("board_id", id)
      .returns<ChecklistItem[]>(),
    supabase.from("comments").select("card_id").eq("board_id", id).returns<{ card_id: string }[]>(),
    supabase
      .from("board_members")
      .select("profiles(id, email)")
      .eq("board_id", id)
      .order("added_at")
      .returns<{ profiles: Profile | null }[]>(),
    supabase.from("card_members").select("card_id, user_id").eq("board_id", id).returns<CardMember[]>(),
    getBoards(),
    getWorkspaces(),
    getUser(),
  ]);

  if (!board) notFound();
  const isOwner = board.owner_id === user?.id;

  // Feeds the "Recently viewed" section on the boards page (a board setting, so owner only).
  if (isOwner) await supabase.from("boards").update({ last_viewed_at: new Date().toISOString() }).eq("id", id);

  const [{ data: owner }, { data: teamRows }] = await Promise.all([
    supabase.from("profiles").select("id, email").eq("id", board.owner_id).maybeSingle<Profile>(),
    // Visible only to people in the board's team (RLS); guests the board was shared with get none.
    supabase
      .from("workspace_members")
      .select("role, profiles(id, email)")
      .eq("workspace_id", board.workspace_id)
      .order("joined_at")
      .returns<{ role: Role; profiles: Profile | null }[]>(),
  ]);
  const team = (teamRows ?? []).flatMap((m) => (m.profiles ? [{ ...m.profiles, role: m.role }] : []));
  const canManage = isOwner || team.some((m) => m.id === user?.id && m.role === "admin");

  // Everyone who can work on the board, once each.
  const seen = new Set<string>();
  const people: Profile[] = [
    owner ?? { id: board.owner_id, email: "Board owner" },
    ...team.map(({ id, email }) => ({ id, email })),
    ...(memberRows ?? []).flatMap((m) => (m.profiles ? [m.profiles] : [])),
  ].filter((p) => !seen.has(p.id) && !!seen.add(p.id));

  const commentCounts: Record<string, number> = {};
  for (const r of commentRows ?? []) commentCounts[r.card_id] = (commentCounts[r.card_id] ?? 0) + 1;

  return (
    <div className="flex h-dvh flex-col" style={{ background: board.background }}>
      <RefreshIfStale renderId={crypto.randomUUID()} />
      <TopNav dark />
      <BoardView
        initial={{
          board,
          lists: lists ?? [],
          cards: cards ?? [],
          labels: labels ?? [],
          cardLabels: cardLabels ?? [],
          checklists: checklists ?? [],
          items: items ?? [],
          commentCounts,
          people,
          cardMembers: cardMembers ?? [],
          canManage,
          teamMemberIds: team.map((m) => m.id),
        }}
        currentUserId={user?.id ?? ""}
        allBoards={allBoards}
        workspaces={workspaces}
      />
    </div>
  );
}
