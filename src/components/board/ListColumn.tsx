"use client";

import { useState } from "react";
import { Draggable, Droppable, type DraggableProvided } from "@hello-pangea/dnd";
import type { Card, List } from "@/lib/types";
import { useBoard, type SortMode } from "./BoardProvider";
import { CardTile } from "./CardTile";
import { Popover, PopoverButton } from "./Popover";
import { InlineEdit } from "../InlineEdit";
import { AddForm } from "../AddForm";
import { DotsIcon } from "../Icons";

type Menu = null | "main" | "copy" | "move" | "sort";

export function ListColumn({
  list,
  cards,
  provided,
  onOpenCard,
}: {
  list: List;
  cards: Card[];
  provided: DraggableProvided;
  onOpenCard: (id: string) => void;
}) {
  const { updateList, addCard, copyList, moveAllCards, archiveAllCards, sortList, activeLists, cardsIn } = useBoard();
  const [menu, setMenu] = useState<Menu>(null);
  const [copyTitle, setCopyTitle] = useState(list.title);
  const total = cardsIn(list.id).length;

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      className="flex max-h-full w-[85vw] shrink-0 snap-center flex-col rounded-xl bg-[#f1f2f4] shadow sm:w-72"
    >
      <div className="relative">
        <div {...provided.dragHandleProps} className="flex items-start gap-1 px-2 pt-2">
          <InlineEdit
            value={list.title}
            onSave={(t) => updateList(list.id, { title: t })}
            className="flex-1 break-words rounded px-2 py-1 text-sm font-semibold text-gray-800"
            inputClassName="w-full flex-1 rounded px-2 py-1 text-sm font-semibold"
          />
          <span className="mt-1.5 text-xs text-gray-500" title="Cards">
            {cards.length === total ? total : `${cards.length}/${total}`}
          </span>
          <button
            onClick={() => setMenu(menu ? null : "main")}
            className="rounded p-1.5 text-gray-600 hover:bg-gray-300"
            aria-label="List actions"
          >
            <DotsIcon />
          </button>
        </div>

          {menu === "main" && (
            <Popover title="List actions" onClose={() => setMenu(null)} align="right">
              <PopoverButton
                onClick={() => {
                  setCopyTitle(list.title);
                  setMenu("copy");
                }}
              >
                Copy list…
              </PopoverButton>
              <PopoverButton onClick={() => setMenu("move")}>Move all cards in this list…</PopoverButton>
              <PopoverButton onClick={() => setMenu("sort")}>Sort by…</PopoverButton>
              <hr className="my-1" />
              <PopoverButton
                onClick={() => {
                  setMenu(null);
                  if (total && confirm(`Archive all ${total} cards in this list?`)) archiveAllCards(list.id);
                }}
              >
                Archive all cards in this list
              </PopoverButton>
              <PopoverButton
                onClick={() => {
                  setMenu(null);
                  updateList(list.id, { archived: true });
                }}
              >
                Archive this list
              </PopoverButton>
            </Popover>
          )}

          {menu === "copy" && (
            <Popover title="Copy list" onClose={() => setMenu(null)} align="right">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!copyTitle.trim()) return;
                  setMenu(null);
                  copyList(list.id, copyTitle.trim());
                }}
              >
                <label className="mb-1 block text-xs font-semibold text-gray-600">Name</label>
                <textarea
                  autoFocus
                  value={copyTitle}
                  onChange={(e) => setCopyTitle(e.target.value)}
                  className="mb-2 w-full rounded border border-gray-300 p-2"
                />
                <button className="rounded bg-[#0c66e4] px-3 py-1.5 text-white">Create list</button>
              </form>
            </Popover>
          )}

          {menu === "move" && (
            <Popover title="Move all cards in list" onClose={() => setMenu(null)} align="right">
              {activeLists.map((l) => (
                <PopoverButton
                  key={l.id}
                  onClick={() => {
                    setMenu(null);
                    moveAllCards(list.id, l.id);
                  }}
                >
                  {l.title} {l.id === list.id && <span className="text-gray-500">(current)</span>}
                </PopoverButton>
              ))}
            </Popover>
          )}

          {menu === "sort" && (
            <Popover title="Sort list" onClose={() => setMenu(null)} align="right">
              {(
                [
                  ["newest", "Date created (newest first)"],
                  ["oldest", "Date created (oldest first)"],
                  ["name", "Card name (alphabetically)"],
                  ["due", "Due date"],
                ] as [SortMode, string][]
              ).map(([mode, label]) => (
                <PopoverButton
                  key={mode}
                  onClick={() => {
                    setMenu(null);
                    sortList(list.id, mode);
                  }}
                >
                  {label}
                </PopoverButton>
              ))}
            </Popover>
          )}
      </div>

      <Droppable droppableId={list.id} type="card">
        {(dp, snapshot) => (
          <div
            ref={dp.innerRef}
            {...dp.droppableProps}
            className={`mx-1 min-h-3 flex-1 overflow-y-auto rounded px-1 pt-1 ${snapshot.isDraggingOver ? "bg-black/5" : ""}`}
          >
            {cards.map((card, i) => (
              <Draggable draggableId={card.id} index={i} key={card.id}>
                {(cp) => (
                  <div ref={cp.innerRef} {...cp.draggableProps} {...cp.dragHandleProps} className="pb-2">
                    <CardTile card={card} onOpen={() => onOpenCard(card.id)} />
                  </div>
                )}
              </Draggable>
            ))}
            {dp.placeholder}
          </div>
        )}
      </Droppable>

      <div className="p-2 pt-0">
        <AddForm label="+ Add a card" placeholder="Enter a title for this card…" onAdd={(t) => addCard(list.id, t)} multiline />
      </div>
    </div>
  );
}
