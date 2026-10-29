"use client";

import { useState } from "react";
import { LABEL_COLORS } from "@/lib/types";
import { useBoard, type DueFilter } from "./BoardProvider";
import { Popover } from "./Popover";
import { FilterIcon } from "../Icons";

const DUE_OPTIONS: [DueFilter, string][] = [
  ["none", "No dates"],
  ["overdue", "Overdue"],
  ["soon", "Due in the next day"],
  ["complete", "Marked as complete"],
];

export function FilterButton() {
  const { filter, setFilter, filterActive, clearFilter, labels, activeLists, cardsIn, matches } = useBoard();
  const [open, setOpen] = useState(false);
  const shown = activeLists.reduce((n, l) => n + cardsIn(l.id).filter(matches).length, 0);

  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-sm font-medium ${
          filterActive ? "bg-white text-gray-900" : "bg-white/20 hover:bg-white/30"
        }`}
      >
        <FilterIcon /> <span className="hidden sm:inline">Filter</span>
        {filterActive && <span className="rounded bg-[#0c66e4] px-1.5 text-xs text-white">{shown}</span>}
      </button>
      {open && (
        <Popover title="Filter" onClose={() => setOpen(false)} align="right" className="w-80">
          <label className="mb-1 block text-xs font-semibold text-gray-600">Keyword</label>
          <input
            autoFocus
            value={filter.keyword}
            onChange={(e) => setFilter({ ...filter, keyword: e.target.value })}
            placeholder="Search cards…"
            className="mb-3 w-full rounded border border-gray-300 px-2 py-1.5 outline-none focus:border-[#0c66e4]"
          />

          <p className="mb-1 text-xs font-semibold text-gray-600">Due date</p>
          {DUE_OPTIONS.map(([v, label]) => (
            <label key={v} className="flex items-center gap-2 rounded px-1 py-1 hover:bg-gray-50">
              <input
                type="checkbox"
                checked={filter.due.includes(v)}
                onChange={() => setFilter({ ...filter, due: toggle(filter.due, v) })}
              />
              {label}
            </label>
          ))}

          <p className="mb-1 mt-3 text-xs font-semibold text-gray-600">Labels</p>
          <div className="max-h-48 overflow-y-auto">
            {labels.map((l) => (
              <label key={l.id} className="flex items-center gap-2 rounded px-1 py-1 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={filter.labelIds.includes(l.id)}
                  onChange={() => setFilter({ ...filter, labelIds: toggle(filter.labelIds, l.id) })}
                />
                <span
                  className="flex h-6 flex-1 items-center rounded px-2 text-xs font-semibold text-gray-900"
                  style={{ background: LABEL_COLORS[l.color] ?? l.color }}
                >
                  {l.name}
                </span>
              </label>
            ))}
          </div>

          {filterActive && (
            <button onClick={clearFilter} className="mt-3 w-full rounded bg-gray-100 py-1.5 hover:bg-gray-200">
              Clear filters
            </button>
          )}
        </Popover>
      )}
    </div>
  );
}
