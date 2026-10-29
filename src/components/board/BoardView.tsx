"use client";

import { useState } from "react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { positionBetween, type Board, type Workspace } from "@/lib/types";
import { BoardProvider, useBoard, type BoardData } from "./BoardProvider";
import { BoardSwitcher } from "./BoardSwitcher";
import { BoardSidebar } from "./BoardSidebar";
import { BoardMenu } from "./BoardMenu";
import { FilterButton } from "./FilterButton";
import { ListColumn } from "./ListColumn";
import { CardModal } from "./CardModal";
import { InlineEdit } from "../InlineEdit";
import { AddForm } from "../AddForm";
import { DotsIcon, StarIcon } from "../Icons";

type Props = {
  initial: BoardData;
  allBoards: Board[];
  workspaces: Workspace[];
  userEmail: string;
};

export function BoardView(props: Props) {
  return (
    <BoardProvider key={props.initial.board.id} initial={props.initial}>
      <BoardScreen {...props} />
    </BoardProvider>
  );
}

function BoardScreen({ allBoards, workspaces, userEmail }: Props) {
  const b = useBoard();
  const { board, activeLists, cardsIn, matches, filterActive, clearFilter } = b;
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const openCard = b.cards.find((c) => c.id === openCardId) ?? null;

  // Keep the switcher/sidebar in sync with this board's live title/star/background.
  const boards = allBoards.map((x) => (x.id === board.id ? { ...x, ...board } : x));
  const visibleIn = (listId: string) => cardsIn(listId).filter(matches);

  async function onDragEnd({ source, destination, draggableId, type }: DropResult) {
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
        workspace={workspaces.find((w) => w.id === board.workspace_id)}
        currentId={board.id}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2 bg-black/25 px-3 py-2 text-white backdrop-blur-sm">
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
          <BoardSwitcher boards={boards} workspaces={workspaces} currentId={board.id} />

          <div className="ml-auto flex items-center gap-2">
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

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="board" direction="horizontal" type="list">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex flex-1 snap-x snap-mandatory items-start gap-3 overflow-x-auto p-3 sm:snap-none sm:p-4"
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
      {openCard && <CardModal card={openCard} userEmail={userEmail} onClose={() => setOpenCardId(null)} />}
    </div>
  );
}
