"use client";

import { useState } from "react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { positionBetween, type Board, type Workspace } from "@/lib/types";
import { BoardProvider, useBoard, type BoardData } from "./BoardProvider";
import { BoardSwitcher } from "./BoardSwitcher";
import { BoardSidebar } from "./BoardSidebar";
import { BoardMenu } from "./BoardMenu";
import { FilterButton } from "./FilterButton";
import { ShareButton } from "./ShareButton";
import { ListColumn } from "./ListColumn";
import { CardModal } from "./CardModal";
import { InlineEdit } from "../InlineEdit";
import { AddForm } from "../AddForm";
import { DotsIcon, StarIcon } from "../Icons";

type Props = {
  initial: BoardData;
  allBoards: Board[];
  workspaces: Workspace[];
  currentUserId: string;
};

export function BoardView(props: Props) {
  return (
    <BoardProvider key={props.initial.board.id} initial={props.initial} currentUserId={props.currentUserId}>
      <BoardScreen {...props} />
    </BoardProvider>
  );
}

function BoardScreen({ allBoards, workspaces, currentUserId }: Props) {
  const b = useBoard();
  const { board, activeLists, cardsIn, matches, filterActive, clearFilter } = b;
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const openCard = b.cards.find((c) => c.id === openCardId) ?? null;

  // Keep the switcher/sidebar in sync with this board's live title/star/background.
  const boards = allBoards.map((x) => (x.id === board.id ? { ...x, ...board } : x));
  const visibleIn = (listId: string) => cardsIn(listId).filter(matches);

  async function onDragEnd({ source, destination, draggableId, type }: DropResult) {
    setDragging(false);
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (type === "list") {
      const others = activeLists.filter((l) => l.id !== draggableId);
      const position = positionBetween(others[destination.index - 1]?.position, others[destination.index]?.position);
      await b.updateList(draggableId, { position });
      return;
    }

    // Indexes refer to the visible (filtered) cards in the destination list.
    const listId = destination.droppableId;
    const others = visibleIn(listId).filter((c) => c.id !== draggableId);
    const position = positionBetween(others[destination.index - 1]?.position, others[destination.index]?.position);
    await b.updateCard(draggableId, { list_id: listId, position });
  }

  return (
    <div className="flex min-h-0 flex-1">
      <BoardSidebar
        boards={boards}
        workspace={workspaces.find((w) => w.id === board.workspace_id) ?? workspaces[0]}
        currentId={board.id}
        currentUserId={currentUserId}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2 bg-black/25 px-3 py-2 text-white backdrop-blur-sm">
          {/* Board settings (title, star) belong to the owner; members just see them. */}
          {b.isOwner ? (
            <>
              <InlineEdit
                value={board.title}
                onSave={(t) => b.updateBoard({ title: t })}
                className="max-w-[60vw] truncate rounded px-2 py-1 text-lg font-bold hover:bg-white/20"
                inputClassName="rounded px-2 py-1 text-lg font-bold text-gray-900"
              />
              <button
                onClick={() => b.updateBoard({ starred: !board.starred })}
                className="rounded p-1.5 hover:bg-white/20"
                aria-label={board.starred ? "Unstar board" : "Star board"}
                aria-pressed={board.starred}
              >
                <StarIcon filled={board.starred} className={`h-4 w-4 ${board.starred ? "text-[#f5cd47]" : ""}`} />
              </button>
            </>
          ) : (
            <h1 className="max-w-[60vw] truncate px-2 py-1 text-lg font-bold">{board.title}</h1>
          )}
          <BoardSwitcher boards={boards} workspaces={workspaces} currentId={board.id} currentUserId={currentUserId} />

          <div className="ml-auto flex items-center gap-2">
            <ShareButton />
            <FilterButton />
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="rounded bg-white/20 p-2 hover:bg-white/30"
              aria-label="Board menu"
              aria-expanded={menuOpen}
            >
              <DotsIcon />
            </button>
          </div>
        </div>

        {filterActive && (
          <div className="flex items-center justify-between bg-[#0c66e4] px-4 py-1.5 text-sm text-white">
            <span>Filtering cards — only matching cards are shown.</span>
            <button onClick={clearFilter} className="rounded bg-white/20 px-2 py-0.5 hover:bg-white/30">
              Clear
            </button>
          </div>
        )}

        <DragDropContext onDragStart={() => setDragging(true)} onDragEnd={onDragEnd}>
          <Droppable droppableId="board" direction="horizontal" type="list">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                // The board is the only scroll container, so the drag library auto-scrolls it
                // (sideways too) when a card is dragged near an edge. Lists grow with their cards.
                // Phone snapping is paused mid-drag because it would undo each auto-scroll step.
                className={`flex flex-1 items-start gap-3 overflow-auto p-3 sm:p-4 ${
                  dragging ? "snap-none" : "snap-x snap-mandatory sm:snap-none"
                }`}
              >
                {activeLists.map((list, index) => (
                  <Draggable draggableId={list.id} index={index} key={list.id}>
                    {(p) => (
                      <ListColumn list={list} cards={visibleIn(list.id)} provided={p} onOpenCard={setOpenCardId} />
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                <div className="w-[85vw] shrink-0 snap-center rounded-xl bg-white/25 p-2 sm:w-72">
                  <AddForm label="+ Add another list" placeholder="Enter list title…" onAdd={b.addList} light />
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {menuOpen && <BoardMenu onClose={() => setMenuOpen(false)} onOpenCard={setOpenCardId} />}
      {openCard && <CardModal card={openCard} onClose={() => setOpenCardId(null)} />}
    </div>
  );
}
