export type Workspace = { id: string; name: string; created_at: string };
export type Board = {
  id: string;
  workspace_id: string;
  title: string;
  background: string;
  starred: boolean;
  last_viewed_at: string | null;
  created_at: string;
};
export type List = { id: string; board_id: string; title: string; position: number; archived: boolean };
export type Card = {
  id: string;
  board_id: string;
  list_id: string;
  title: string;
  description: string;
  position: number;
  due_at: string | null;
  due_complete: boolean;
  cover: string | null;
  archived: boolean;
  created_at: string;
};
export type Label = { id: string; board_id: string; name: string; color: string };
export type CardLabel = { card_id: string; label_id: string };
export type Checklist = { id: string; card_id: string; title: string; position: number };
export type ChecklistItem = { id: string; checklist_id: string; title: string; done: boolean; position: number };
export type Comment = { id: string; card_id: string; author_id: string; body: string; created_at: string };

export const BOARD_COLUMNS = "id, workspace_id, title, background, starred, last_viewed_at, created_at";
export const LIST_COLUMNS = "id, board_id, title, position, archived";
export const CARD_COLUMNS =
  "id, board_id, list_id, title, description, position, due_at, due_complete, cover, archived, created_at";

export const LABEL_COLORS: Record<string, string> = {
  green: "#4bce97",
  yellow: "#f5cd47",
  orange: "#fea362",
  red: "#f87168",
  purple: "#9f8fef",
  blue: "#579dff",
  sky: "#6cc3e0",
  lime: "#94c748",
  pink: "#e774bb",
  black: "#8590a2",
};

// Position for an item dropped between `before` and `after` (fractional indexing).
export function positionBetween(before?: number, after?: number) {
  if (before === undefined && after === undefined) return 1024;
  if (before === undefined) return after! / 2;
  if (after === undefined) return before + 1024;
  return (before + after) / 2;
}

export type DueStatus = "complete" | "overdue" | "soon" | "later";

export function dueStatus(card: Pick<Card, "due_at" | "due_complete">, now = Date.now()): DueStatus | null {
  if (!card.due_at) return null;
  if (card.due_complete) return "complete";
  const ms = new Date(card.due_at).getTime() - now;
  if (ms < 0) return "overdue";
  if (ms < 24 * 60 * 60 * 1000) return "soon";
  return "later";
}

export const DUE_STYLES: Record<DueStatus, string> = {
  complete: "bg-[#1f845a] text-white",
  overdue: "bg-[#c9372c] text-white",
  soon: "bg-[#f5cd47] text-gray-900",
  later: "bg-transparent text-inherit",
};

export function formatDue(iso: string) {
  const d = new Date(iso);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
    hour: "numeric",
    minute: "2-digit",
  });
}
