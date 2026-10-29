"use client";

import { DUE_STYLES, LABEL_COLORS, dueStatus, formatDue, type Card } from "@/lib/types";
import { useBoard } from "./BoardProvider";
import { CalendarIcon, CheckSquareIcon, CommentIcon, TextIcon } from "../Icons";

export function CardTile({ card, onOpen }: { card: Card; onOpen: () => void }) {
  const { labelsOf, checklistProgress, commentCounts, updateCard } = useBoard();
  const labels = labelsOf(card.id);
  const progress = checklistProgress(card.id);
  const comments = commentCounts[card.id] ?? 0;
  const status = dueStatus(card);

  return (
    <div
      onClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      className="group cursor-pointer overflow-hidden rounded-lg bg-white text-sm shadow-[0_1px_1px_rgba(9,30,66,0.25)] ring-[#388bff] hover:ring-2"
    >
      {card.cover && <div className="h-8" style={{ background: LABEL_COLORS[card.cover] ?? card.cover }} />}
      <div className="px-3 py-2">
        {labels.length > 0 && (
          <div className="mb-1.5 flex flex-wrap gap-1">
            {labels.map((l) =>
              l.name ? (
                <span
                  key={l.id}
                  className="max-w-full truncate rounded px-2 py-0.5 text-[11px] font-semibold leading-4 text-gray-900"
                  style={{ background: LABEL_COLORS[l.color] ?? l.color }}
                >
                  {l.name}
                </span>
              ) : (
                <span
                  key={l.id}
                  className="h-2 w-10 rounded-full"
                  style={{ background: LABEL_COLORS[l.color] ?? l.color }}
                />
              ),
            )}
          </div>
        )}

        <p className="break-words text-gray-800">{card.title}</p>

        {(status || card.description || comments > 0 || progress.total > 0) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-600">
            {status && card.due_at && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  updateCard(card.id, { due_complete: !card.due_complete });
                }}
                title={card.due_complete ? "Mark incomplete" : "Mark complete"}
                className={`flex items-center gap-1 rounded px-1.5 py-0.5 ${DUE_STYLES[status]}`}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                {formatDue(card.due_at)}
              </button>
            )}
            {card.description && (
              <span title="This card has a description">
                <TextIcon className="h-3.5 w-3.5" />
              </span>
            )}
            {comments > 0 && (
              <span className="flex items-center gap-1" title="Comments">
                <CommentIcon className="h-3.5 w-3.5" />
                {comments}
              </span>
            )}
            {progress.total > 0 && (
              <span
                className={`flex items-center gap-1 rounded px-1 py-0.5 ${
                  progress.done === progress.total ? "bg-[#1f845a] text-white" : ""
                }`}
                title="Checklist items"
              >
                <CheckSquareIcon className="h-3.5 w-3.5" />
                {progress.done}/{progress.total}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
