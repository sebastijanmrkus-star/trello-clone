"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { createClient } from "@/lib/supabase/client";
import { positionBetween, type Board, type Card, type List } from "@/lib/types";
import { InlineEdit } from "./InlineEdit";
import { AddForm } from "./AddForm";
import { CardModal } from "./CardModal";
import { StarButton } from "./StarButton";

const byPosition = <T extends { position: number }>(a: T, b: T) => a.position - b.position;

export function BoardView({
  board,
  initialLists,
  initialCards,
}: {
  board: Board;
  initialLists: List[];
  initialCards: Card[];
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [title, setTitle] = useState(board.title);
  const [lists, setLists] = useState(initialLists);
  const [cards, setCards] = useState(initialCards);
  const [openCardId, setOpenCardId] = useState<string | null>(null);

  const sortedLists = [...lists].sort(byPosition);
  const cardsIn = (listId: string) => cards.filter((c) => c.list_id === listId).sort(byPosition);
  const openCard = cards.find((c) => c.id === openCardId) ?? null;

  // Run a write; on failure, report it and reload server state.
  async function persist(p: PromiseLike<{ error: { message: string } | null }>) {
    const { error } = await p;
    if (error) {
      alert(error.message);
      router.refresh();
    }
  }

  async function renameBoard(t: string) {
    setTitle(t);
    await persist(supabase.from("boards").update({ title: t }).eq("id", board.id));
  }

  async function deleteBoard() {
    if (!confirm(`Delete board "${title}" and everything in it?`)) return;
    const { error } = await supabase.from("boards").delete().eq("id", board.id);
    if (error) return alert(error.message);
    router.push("/");
    router.refresh();
  }

  async function addList(t: string) {
    const position = positionBetween(sortedLists.at(-1)?.position);
    const { data, error } = await supabase
      .from("lists")
      .insert({ board_id: board.id, title: t, position })
      .select("id, board_id, title, position")
      .single<List>();
    if (error) return alert(error.message);
    setLists((ls) => [...ls, data]);
  }

  async function renameList(id: string, t: string) {
    setLists((ls) => ls.map((l) => (l.id === id ? { ...l, title: t } : l)));
    await persist(supabase.from("lists").update({ title: t }).eq("id", id));
  }

  async function deleteList(id: string) {
    if (!confirm("Delete this list and its cards?")) return;
    setLists((ls) => ls.filter((l) => l.id !== id));
    setCards((cs) => cs.filter((c) => c.list_id !== id));
    await persist(supabase.from("lists").delete().eq("id", id));
  }

  async function addCard(listId: string, t: string) {
    const position = positionBetween(cardsIn(listId).at(-1)?.position);
    const { data, error } = await supabase
      .from("cards")
      .insert({ board_id: board.id, list_id: listId, title: t, position })
      .select("id, board_id, list_id, title, description, position")
      .single<Card>();
    if (error) return alert(error.message);
    setCards((cs) => [...cs, data]);
  }

  async function updateCard(id: string, patch: Partial<Pick<Card, "title" | "description">>) {
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    await persist(supabase.from("cards").update(patch).eq("id", id));
  }

  async function deleteCard(id: string) {
    setOpenCardId(null);
    setCards((cs) => cs.filter((c) => c.id !== id));
    await persist(supabase.from("cards").delete().eq("id", id));
  }

  async function onDragEnd({ source, destination, draggableId, type }: DropResult) {
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (type === "list") {
      const others = sortedLists.filter((l) => l.id !== draggableId);
      const position = positionBetween(
        others[destination.index - 1]?.position,
        others[destination.index]?.position,
      );
      setLists((ls) => ls.map((l) => (l.id === draggableId ? { ...l, position } : l)));
      await persist(supabase.from("lists").update({ position }).eq("id", draggableId));
      return;
    }

    const listId = destination.droppableId;
    const others = cardsIn(listId).filter((c) => c.id !== draggableId);
    const position = positionBetween(
      others[destination.index - 1]?.position,
      others[destination.index]?.position,
    );
    setCards((cs) => cs.map((c) => (c.id === draggableId ? { ...c, list_id: listId, position } : c)));
    await persist(supabase.from("cards").update({ list_id: listId, position }).eq("id", draggableId));
  }

  return (
    <>
      <div className="flex items-center justify-between bg-black/20 px-4 py-2 text-white">
        <div className="flex items-center gap-1">
          <InlineEdit
            value={title}
            onSave={renameBoard}
            className="rounded px-2 py-1 text-lg font-bold hover:bg-white/20"
            inputClassName="rounded px-2 py-1 text-lg font-bold text-gray-900"
          />
          <StarButton boardId={board.id} starred={board.starred} className="rounded p-1.5 hover:bg-white/20" />
        </div>
        <button onClick={deleteBoard} className="rounded bg-white/20 px-3 py-1 text-sm hover:bg-red-600">
          Delete board
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" direction="horizontal" type="list">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex flex-1 items-start gap-3 overflow-x-auto p-4"
            >
              {sortedLists.map((list, index) => (
                <Draggable draggableId={list.id} index={index} key={list.id}>
                  {(p) => (
                    <div
                      ref={p.innerRef}
                      {...p.draggableProps}
                      className="flex max-h-full w-72 shrink-0 flex-col rounded-lg bg-[#ebecf0] shadow"
                    >
                      <div {...p.dragHandleProps} className="flex items-center justify-between px-2 pt-2">
                        <InlineEdit
                          value={list.title}
                          onSave={(t) => renameList(list.id, t)}
                          className="flex-1 rounded px-2 py-1 text-sm font-semibold"
                          inputClassName="w-full rounded px-2 py-1 text-sm font-semibold"
                        />
                        <button
                          onClick={() => deleteList(list.id)}
                          className="rounded px-2 text-gray-500 hover:bg-gray-300"
                          aria-label="Delete list"
                        >
                          ×
                        </button>
                      </div>

                      <Droppable droppableId={list.id} type="card">
                        {(dp, snapshot) => (
                          <div
                            ref={dp.innerRef}
                            {...dp.droppableProps}
                            className={`min-h-2 flex-1 overflow-y-auto px-2 py-1 ${
                              snapshot.isDraggingOver ? "bg-gray-300/50" : ""
                            }`}
                          >
                            {cardsIn(list.id).map((card, ci) => (
                              <Draggable draggableId={card.id} index={ci} key={card.id}>
                                {(cp) => (
                                  <div
                                    ref={cp.innerRef}
                                    {...cp.draggableProps}
                                    {...cp.dragHandleProps}
                                    onClick={() => setOpenCardId(card.id)}
                                    className="mb-2 cursor-pointer rounded bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
                                  >
                                    {card.title}
                                    {card.description && (
                                      <div className="mt-1 text-xs text-gray-500" title="Has description">
                                        ≡
                                      </div>
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {dp.placeholder}
                          </div>
                        )}
                      </Droppable>

                      <div className="p-2">
                        <AddForm
                          label="+ Add a card"
                          placeholder="Enter a title for this card…"
                          onAdd={(t) => addCard(list.id, t)}
                          multiline
                        />
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              <div className="w-72 shrink-0 rounded-lg bg-white/25 p-2">
                <AddForm label="+ Add another list" placeholder="Enter list title…" onAdd={addList} light />
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {openCard && (
        <CardModal
          card={openCard}
          listTitle={lists.find((l) => l.id === openCard.list_id)?.title ?? ""}
          onClose={() => setOpenCardId(null)}
          onUpdate={(patch) => updateCard(openCard.id, patch)}
          onDelete={() => deleteCard(openCard.id)}
        />
      )}
    </>
  );
}
