import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopNav } from "@/components/TopNav";
import { BoardView } from "@/components/BoardView";
import { BOARD_COLUMNS, type Board, type Card, type List } from "@/lib/types";

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: board }, { data: lists }, { data: cards }] = await Promise.all([
    supabase.from("boards").select(BOARD_COLUMNS).eq("id", id).maybeSingle<Board>(),
    supabase.from("lists").select("id, board_id, title, position").eq("board_id", id).order("position").returns<List[]>(),
    supabase
      .from("cards")
      .select("id, board_id, list_id, title, description, position")
      .eq("board_id", id)
      .order("position")
      .returns<Card[]>(),
  ]);

  if (!board) notFound();

  // Feeds the "Recently viewed" section on the boards page.
  await supabase.from("boards").update({ last_viewed_at: new Date().toISOString() }).eq("id", id);

  return (
    <div className="flex h-screen flex-col" style={{ background: board.background }}>
      <TopNav dark />
      <BoardView board={board} initialLists={lists ?? []} initialCards={cards ?? []} />
    </div>
  );
}
