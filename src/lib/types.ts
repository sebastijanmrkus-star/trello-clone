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
export type List = { id: string; board_id: string; title: string; position: number };
export type Card = {
  id: string;
  board_id: string;
  list_id: string;
  title: string;
  description: string;
  position: number;
};

export const BOARD_COLUMNS = "id, workspace_id, title, background, starred, last_viewed_at, created_at";

// Position for an item dropped between `before` and `after` (fractional indexing).
export function positionBetween(before?: number, after?: number) {
  if (before === undefined && after === undefined) return 1024;
  if (before === undefined) return after! / 2;
  if (after === undefined) return before + 1024;
  return (before + after) / 2;
}
