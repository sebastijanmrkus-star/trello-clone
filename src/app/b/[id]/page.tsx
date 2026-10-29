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
    getBoards(),
    getWorkspaces(),
    getUser(),
  ]);

  if (!board) notFound();

  // Feeds the "Recently viewed" section on the boards page.
  await supabase.from("boards").update({ last_viewed_at: new Date().toISOString() }).eq("id", id);

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
        }}
        allBoards={allBoards}
        workspaces={workspaces}
        userEmail={user?.email ?? ""}
      />
    </div>
  );
}
