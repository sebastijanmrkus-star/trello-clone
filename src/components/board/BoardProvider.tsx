"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  dueStatus,
  positionBetween,
  type Board,
  type Card,
  type CardLabel,
  type Checklist,
  type ChecklistItem,
  type Label,
  type List,
} from "@/lib/types";

export type BoardData = {
  board: Board;
  lists: List[];
  cards: Card[];
  labels: Label[];
  cardLabels: CardLabel[];
  checklists: Checklist[];
  items: ChecklistItem[];
  commentCounts: Record<string, number>;
};

export type DueFilter = "overdue" | "soon" | "none" | "complete";
export type Filter = { keyword: string; labelIds: string[]; due: DueFilter[] };
export type SortMode = "newest" | "oldest" | "name" | "due";

const byPosition = <T extends { position: number }>(a: T, b: T) => a.position - b.position;
const EMPTY_FILTER: Filter = { keyword: "", labelIds: [], due: [] };

function useBoardState(initial: BoardData) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [board, setBoard] = useState(initial.board);
  const [lists, setLists] = useState(initial.lists);
  const [cards, setCards] = useState(initial.cards);
  const [labels, setLabels] = useState(initial.labels);
  const [cardLabels, setCardLabels] = useState(initial.cardLabels);
  const [checklists, setChecklists] = useState(initial.checklists);
  const [items, setItems] = useState(initial.items);
  const [commentCounts, setCommentCounts] = useState(initial.commentCounts);
  const [filter, setFilter] = useState<Filter>(EMPTY_FILTER);
  const boardId = board.id;

  // A router.refresh() hands us fresh server data; adopt it.
  const [seen, setSeen] = useState(initial);
  if (seen !== initial) {
    setSeen(initial);
    setBoard(initial.board);
    setLists(initial.lists);
    setCards(initial.cards);
    setLabels(initial.labels);
    setCardLabels(initial.cardLabels);
    setChecklists(initial.checklists);
    setItems(initial.items);
    setCommentCounts(initial.commentCounts);
  }

  // Run a write; on failure, report it and reload server state.
  async function persist(p: PromiseLike<{ error: { message: string } | null }>) {
    const { error } = await p;
    if (error) {
      alert(error.message);
      router.refresh();
      return false;
    }
    return true;
  }

  // ---- derived ----
  const activeLists = lists.filter((l) => !l.archived).sort(byPosition);
  const cardsIn = (listId: string) => cards.filter((c) => c.list_id === listId && !c.archived).sort(byPosition);
  const labelsOf = (cardId: string) => {
    const ids = new Set(cardLabels.filter((cl) => cl.card_id === cardId).map((cl) => cl.label_id));
    return labels.filter((l) => ids.has(l.id));
  };
  const filterActive = filter.keyword.trim() !== "" || filter.labelIds.length > 0 || filter.due.length > 0;

  function matches(card: Card) {
    const kw = filter.keyword.trim().toLowerCase();
    if (kw && !card.title.toLowerCase().includes(kw) && !card.description.toLowerCase().includes(kw)) return false;
    if (filter.labelIds.length) {
      const mine = new Set(cardLabels.filter((cl) => cl.card_id === card.id).map((cl) => cl.label_id));
      if (!filter.labelIds.some((id) => mine.has(id))) return false;
    }
    if (filter.due.length) {
      const s = dueStatus(card);
      const ok = filter.due.some((d) => (d === "none" ? s === null : d === s));
      if (!ok) return false;
    }
    return true;
  }

  // ---- board ----
  async function updateBoard(patch: Partial<Pick<Board, "title" | "background" | "starred">>) {
    setBoard((b) => ({ ...b, ...patch }));
    if (await persist(supabase.from("boards").update(patch).eq("id", boardId))) router.refresh();
  }

  async function deleteBoard() {
    const { error } = await supabase.from("boards").delete().eq("id", boardId);
    if (error) return alert(error.message);
    router.push("/");
    router.refresh();
  }

  // ---- labels ----
  async function createLabel(name: string, color: string) {
    const label: Label = { id: crypto.randomUUID(), board_id: boardId, name, color };
    setLabels((ls) => [...ls, label]);
    await persist(supabase.from("labels").insert(label));
    return label;
  }

  async function updateLabel(id: string, patch: Partial<Pick<Label, "name" | "color">>) {
    setLabels((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    await persist(supabase.from("labels").update(patch).eq("id", id));
  }

  async function deleteLabel(id: string) {
    setLabels((ls) => ls.filter((l) => l.id !== id));
    setCardLabels((cls) => cls.filter((cl) => cl.label_id !== id));
    setFilter((f) => ({ ...f, labelIds: f.labelIds.filter((x) => x !== id) }));
    await persist(supabase.from("labels").delete().eq("id", id));
  }

  async function toggleCardLabel(cardId: string, labelId: string) {
    const has = cardLabels.some((cl) => cl.card_id === cardId && cl.label_id === labelId);
    if (has) {
      setCardLabels((cls) => cls.filter((cl) => !(cl.card_id === cardId && cl.label_id === labelId)));
      await persist(supabase.from("card_labels").delete().eq("card_id", cardId).eq("label_id", labelId));
    } else {
      setCardLabels((cls) => [...cls, { card_id: cardId, label_id: labelId }]);
      await persist(supabase.from("card_labels").insert({ card_id: cardId, label_id: labelId, board_id: boardId }));
    }
  }

  // ---- lists ----
  async function addList(title: string) {
    const list: List = {
      id: crypto.randomUUID(),
      board_id: boardId,
      title,
      position: positionBetween(activeLists.at(-1)?.position),
      archived: false,
    };
    setLists((ls) => [...ls, list]);
    await persist(supabase.from("lists").insert(list));
  }

  async function updateList(id: string, patch: Partial<Pick<List, "title" | "position" | "archived">>) {
    setLists((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    await persist(supabase.from("lists").update(patch).eq("id", id));
  }

  async function deleteList(id: string) {
    setLists((ls) => ls.filter((l) => l.id !== id));
    setCards((cs) => cs.filter((c) => c.list_id !== id));
    await persist(supabase.from("lists").delete().eq("id", id));
  }

  async function copyList(id: string, title: string) {
    const i = activeLists.findIndex((l) => l.id === id);
    const position = positionBetween(activeLists[i]?.position, activeLists[i + 1]?.position);
    const { error } = await supabase.rpc("copy_list", { p_list_id: id, p_title: title, p_position: position });
    if (error) return alert(error.message);
    router.refresh();
  }

  async function moveAllCards(fromId: string, toId: string) {
    if (fromId === toId) return;
    let pos = cardsIn(toId).at(-1)?.position ?? 0;
    const moves = cardsIn(fromId).map((c) => ({ id: c.id, position: (pos += 1024) }));
    const byId = new Map(moves.map((m) => [m.id, m.position]));
    setCards((cs) => cs.map((c) => (byId.has(c.id) ? { ...c, list_id: toId, position: byId.get(c.id)! } : c)));
    const results = await Promise.all(
      moves.map((m) => supabase.from("cards").update({ list_id: toId, position: m.position }).eq("id", m.id)),
    );
    const failed = results.find((r) => r.error);
    if (failed) await persist(Promise.resolve(failed));
  }

  async function archiveAllCards(listId: string) {
    const ids = cardsIn(listId).map((c) => c.id);
    setCards((cs) => cs.map((c) => (ids.includes(c.id) ? { ...c, archived: true } : c)));
    await persist(supabase.from("cards").update({ archived: true }).in("id", ids));
  }

  async function sortList(listId: string, mode: SortMode) {
    const sorted = [...cardsIn(listId)].sort((a, b) => {
      if (mode === "name") return a.title.localeCompare(b.title);
      if (mode === "oldest") return a.created_at.localeCompare(b.created_at);
      if (mode === "newest") return b.created_at.localeCompare(a.created_at);
      if (!a.due_at) return 1;
      if (!b.due_at) return -1;
      return a.due_at.localeCompare(b.due_at);
    });
    const byId = new Map(sorted.map((c, i) => [c.id, (i + 1) * 1024]));
    setCards((cs) => cs.map((c) => (byId.has(c.id) ? { ...c, position: byId.get(c.id)! } : c)));
    const results = await Promise.all(
      sorted.map((c) => supabase.from("cards").update({ position: byId.get(c.id) }).eq("id", c.id)),
    );
    const failed = results.find((r) => r.error);
    if (failed) await persist(Promise.resolve(failed));
  }

  // ---- cards ----
  async function addCard(listId: string, title: string) {
    const card: Card = {
      id: crypto.randomUUID(),
      board_id: boardId,
      list_id: listId,
      title,
      description: "",
      position: positionBetween(cardsIn(listId).at(-1)?.position),
      due_at: null,
      due_complete: false,
      cover: null,
      archived: false,
      created_at: new Date().toISOString(),
    };
    setCards((cs) => [...cs, card]);
    await persist(supabase.from("cards").insert(card));
  }

  type CardPatch = Partial<
    Pick<Card, "title" | "description" | "due_at" | "due_complete" | "cover" | "archived" | "list_id" | "position">
  >;
  async function updateCard(id: string, patch: CardPatch) {
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    await persist(supabase.from("cards").update(patch).eq("id", id));
  }

  async function deleteCard(id: string) {
    setCards((cs) => cs.filter((c) => c.id !== id));
    setCardLabels((cls) => cls.filter((cl) => cl.card_id !== id));
    await persist(supabase.from("cards").delete().eq("id", id));
  }

  // Move to `index` among the destination list's (unarchived) cards.
  async function moveCard(id: string, listId: string, index: number) {
    const others = cardsIn(listId).filter((c) => c.id !== id);
    const position = positionBetween(others[index - 1]?.position, others[index]?.position);
    await updateCard(id, { list_id: listId, position });
  }

  async function copyCard(id: string, listId: string, index: number, title: string) {
    const others = cardsIn(listId);
    const position = positionBetween(others[index - 1]?.position, others[index]?.position);
    const { error } = await supabase.rpc("copy_card", {
      p_card_id: id,
      p_list_id: listId,
      p_title: title,
      p_position: position,
    });
    if (error) return alert(error.message);
    router.refresh();
  }

  // ---- checklists ----
  async function addChecklist(cardId: string, title: string) {
    const mine = checklists.filter((k) => k.card_id === cardId).sort(byPosition);
    const k: Checklist = { id: crypto.randomUUID(), card_id: cardId, title, position: positionBetween(mine.at(-1)?.position) };
    setChecklists((ks) => [...ks, k]);
    await persist(supabase.from("checklists").insert({ ...k, board_id: boardId }));
  }

  async function renameChecklist(id: string, title: string) {
    setChecklists((ks) => ks.map((k) => (k.id === id ? { ...k, title } : k)));
    await persist(supabase.from("checklists").update({ title }).eq("id", id));
  }

  async function deleteChecklist(id: string) {
    setChecklists((ks) => ks.filter((k) => k.id !== id));
    setItems((is) => is.filter((i) => i.checklist_id !== id));
    await persist(supabase.from("checklists").delete().eq("id", id));
  }

  async function addItem(checklistId: string, title: string) {
    const mine = items.filter((i) => i.checklist_id === checklistId).sort(byPosition);
    const item: ChecklistItem = {
      id: crypto.randomUUID(),
      checklist_id: checklistId,
      title,
      done: false,
      position: positionBetween(mine.at(-1)?.position),
    };
    setItems((is) => [...is, item]);
    await persist(supabase.from("checklist_items").insert({ ...item, board_id: boardId }));
  }

  async function updateItem(id: string, patch: Partial<Pick<ChecklistItem, "title" | "done">>) {
    setItems((is) => is.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    await persist(supabase.from("checklist_items").update(patch).eq("id", id));
  }

  async function deleteItem(id: string) {
    setItems((is) => is.filter((i) => i.id !== id));
    await persist(supabase.from("checklist_items").delete().eq("id", id));
  }

  function checklistProgress(cardId: string) {
    const ks = new Set(checklists.filter((k) => k.card_id === cardId).map((k) => k.id));
    const mine = items.filter((i) => ks.has(i.checklist_id));
    return { done: mine.filter((i) => i.done).length, total: mine.length };
  }

  function adjustCommentCount(cardId: string, delta: number) {
    setCommentCounts((m) => ({ ...m, [cardId]: Math.max(0, (m[cardId] ?? 0) + delta) }));
  }

  return {
    supabase,
    board,
    lists,
    cards,
    labels,
    checklists,
    items,
    commentCounts,
    filter,
    setFilter,
    clearFilter: () => setFilter(EMPTY_FILTER),
    filterActive,
    activeLists,
    cardsIn,
    labelsOf,
    matches,
    checklistProgress,
    updateBoard,
    deleteBoard,
    createLabel,
    updateLabel,
    deleteLabel,
    toggleCardLabel,
    addList,
    updateList,
    deleteList,
    copyList,
    moveAllCards,
    archiveAllCards,
    sortList,
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    copyCard,
    addChecklist,
    renameChecklist,
    deleteChecklist,
    addItem,
    updateItem,
    deleteItem,
    adjustCommentCount,
  };
}

type BoardCtx = ReturnType<typeof useBoardState>;
const Ctx = createContext<BoardCtx | null>(null);

export function BoardProvider({ initial, children }: { initial: BoardData; children: React.ReactNode }) {
  const value = useBoardState(initial);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBoard() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useBoard must be used inside BoardProvider");
  return v;
}
