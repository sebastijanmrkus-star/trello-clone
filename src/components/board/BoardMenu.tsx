"use client";

import { useState } from "react";
import { BACKGROUNDS } from "@/lib/templates";
import { LABEL_COLORS, type Label } from "@/lib/types";
import { useBoard } from "./BoardProvider";
import { LabelEditor } from "./LabelEditor";
import { ArchiveIcon, ChevronLeftIcon, CloseIcon, LogOutIcon, PencilIcon, TagIcon, TrashIcon } from "../Icons";

type View = "main" | "background" | "labels" | "archived";

export function BoardMenu({ onClose, onOpenCard }: { onClose: () => void; onOpenCard: (id: string) => void }) {
  const { board, isOwner, currentUserId, removeBoardMember, updateBoard, deleteBoard, labels, createLabel, updateLabel, deleteLabel, lists, cards, updateCard, deleteCard, updateList, deleteList } =
    useBoard();
  const [view, setView] = useState<View>("main");
  const [editing, setEditing] = useState<Label | "new" | null>(null);
  const [archTab, setArchTab] = useState<"cards" | "lists">("cards");

  const archivedCards = cards.filter((c) => c.archived);
  const archivedLists = lists.filter((l) => l.archived);
  const titles: Record<View, string> = {
    main: "Menu",
    background: "Change background",
    labels: "Labels",
    archived: "Archived items",
  };

  const item = (icon: React.ReactNode, label: string, onClick: () => void, danger = false) => (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded px-3 py-2 text-left text-sm hover:bg-gray-100 ${danger ? "text-red-600" : ""}`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <aside className="fixed bottom-0 right-0 top-12 z-40 flex w-full max-w-sm flex-col border-l border-gray-200 bg-white text-gray-800 shadow-2xl">
      <div className="relative flex items-center justify-center border-b border-gray-200 px-10 py-3 font-semibold">
        {view !== "main" && (
          <button
            onClick={() => (editing ? setEditing(null) : setView("main"))}
            className="absolute left-2 rounded p-1.5 hover:bg-gray-100"
            aria-label="Back"
          >
            <ChevronLeftIcon />
          </button>
        )}
        {titles[view]}
        <button onClick={onClose} className="absolute right-2 rounded p-1.5 hover:bg-gray-100" aria-label="Close menu">
          <CloseIcon />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {view === "main" && (
          <>
            {/* Background and deleting are board settings, so only the owner gets them. */}
            {isOwner &&
              item(<span className="h-4 w-4 rounded-sm" style={{ background: board.background }} />, "Change background", () => setView("background"))}
            {item(<TagIcon />, "Labels", () => setView("labels"))}
            {item(<ArchiveIcon />, `Archived items (${archivedCards.length + archivedLists.length})`, () => setView("archived"))}
            <hr className="my-2" />
            {isOwner
              ? item(
                  <TrashIcon />,
                  "Delete board",
                  () => confirm(`Permanently delete "${board.title}" and everything in it?`) && deleteBoard(),
                  true,
                )
              : item(
                  <LogOutIcon />,
                  "Leave board",
                  () => confirm("Leave this board? You'll lose access to it.") && removeBoardMember(currentUserId),
                  true,
                )}
          </>
        )}

        {view === "background" && (
          <div className="grid grid-cols-2 gap-2">
            {BACKGROUNDS.map((bg) => (
              <button
                key={bg}
                onClick={() => updateBoard({ background: bg })}
                style={{ background: bg }}
                aria-label="Use this background"
                className={`h-20 rounded-lg ${bg === board.background ? "ring-2 ring-[#0c66e4] ring-offset-2" : ""}`}
              />
            ))}
          </div>
        )}

        {view === "labels" &&
          (editing ? (
            <LabelEditor
              label={editing === "new" ? undefined : editing}
              onCancel={() => setEditing(null)}
              onSave={(name, color) => {
                if (editing === "new") createLabel(name, color);
                else updateLabel(editing.id, { name, color });
                setEditing(null);
              }}
              onDelete={
                editing === "new"
                  ? undefined
                  : () => {
                      deleteLabel(editing.id);
                      setEditing(null);
                    }
              }
            />
          ) : (
            <>
              <p className="mb-2 text-xs text-gray-500">Labels help you organize cards by type, priority or team.</p>
              {labels.map((l) => (
                <div key={l.id} className="mb-1.5 flex items-center gap-2">
                  <span
                    className="flex h-8 flex-1 items-center rounded px-3 text-sm font-semibold text-gray-900"
                    style={{ background: LABEL_COLORS[l.color] ?? l.color }}
                  >
                    {l.name}
                  </span>
                  <button onClick={() => setEditing(l)} className="rounded p-2 hover:bg-gray-100" aria-label="Edit label">
                    <PencilIcon />
                  </button>
                </div>
              ))}
              <button onClick={() => setEditing("new")} className="mt-2 w-full rounded bg-gray-100 py-2 text-sm hover:bg-gray-200">
                Create a new label
              </button>
            </>
          ))}

        {view === "archived" && (
          <>
            <div className="mb-3 flex gap-2">
              {(["cards", "lists"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setArchTab(t)}
                  className={`rounded px-3 py-1.5 text-sm ${archTab === t ? "bg-[#e9f2ff] text-[#0c66e4]" : "bg-gray-100"}`}
                >
                  {t === "cards" ? `Cards (${archivedCards.length})` : `Lists (${archivedLists.length})`}
                </button>
              ))}
            </div>
            {archTab === "cards" &&
              (archivedCards.length === 0 ? (
                <p className="text-sm text-gray-500">No archived cards.</p>
              ) : (
                archivedCards.map((c) => (
                  <div key={c.id} className="mb-3">
                    <button
                      onClick={() => onOpenCard(c.id)}
                      className="mb-1 block w-full rounded bg-white p-2 text-left text-sm shadow ring-1 ring-gray-200 hover:ring-[#388bff]"
                    >
                      {c.title}
                      <span className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <ArchiveIcon className="h-3 w-3" /> Archived
                      </span>
                    </button>
                    <div className="flex gap-3 text-xs">
                      <button onClick={() => updateCard(c.id, { archived: false })} className="text-[#0c66e4] underline">
                        Restore
                      </button>
                      <button
                        onClick={() => confirm("Delete this card permanently?") && deleteCard(c.id)}
                        className="text-red-600 underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ))}
            {archTab === "lists" &&
              (archivedLists.length === 0 ? (
                <p className="text-sm text-gray-500">No archived lists.</p>
              ) : (
                archivedLists.map((l) => (
                  <div key={l.id} className="mb-2 flex items-center justify-between rounded bg-gray-50 p-2 text-sm">
                    <span className="truncate">{l.title}</span>
                    <span className="flex shrink-0 gap-3 text-xs">
                      <button onClick={() => updateList(l.id, { archived: false })} className="text-[#0c66e4] underline">
                        Restore
                      </button>
                      <button
                        onClick={() => confirm("Delete this list and all its cards permanently?") && deleteList(l.id)}
                        className="text-red-600 underline"
                      >
                        Delete
                      </button>
                    </span>
                  </div>
                ))
              ))}
          </>
        )}
      </div>
    </aside>
  );
}
