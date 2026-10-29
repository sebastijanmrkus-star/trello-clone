import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";
import { BoardView } from "@/components/BoardView";
import type { Board, Card, List } from "@/lib/types";

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: board }, { data: lists }, { data: cards }] = await Promise.all([
    supabase.from("boards").select("id, title, color, created_at").eq("id", id).maybeSingle<Board>(),
    supabase.from("lists").select("id, board_id, title, position").eq("board_id", id).order("position").returns<List[]>(),
    supabase
      .from("cards")
      .select("id, board_id, list_id, title, description, position")
      .eq("board_id", id)
      .order("position")
      .returns<Card[]>(),
  ]);

  if (!board) notFound();

  return (
    <div className="flex h-screen flex-col" style={{ background: board.color }}>
      <Header email={user?.email} />
      <BoardView board={board} initialLists={lists ?? []} initialCards={cards ?? []} />
    </div>
  );
}
