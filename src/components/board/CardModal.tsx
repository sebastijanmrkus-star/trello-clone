"use client";

import { useEffect, useState } from "react";
import { DUE_STYLES, LABEL_COLORS, dueStatus, formatDue, type Card, type Comment, type Label } from "@/lib/types";
import { useBoard } from "./BoardProvider";
import { Popover } from "./Popover";
import { LabelEditor } from "./LabelEditor";
import { InlineEdit } from "../InlineEdit";
import {
  ArchiveIcon,
  ArrowRightIcon,
  CalendarIcon,
  CheckSquareIcon,
  CloseIcon,
  CommentIcon,
  CopyIcon,
  ImageIcon,
  PencilIcon,
  PlusIcon,
  TagIcon,
  TextIcon,
  TrashIcon,
} from "../Icons";

type Pop = null | "labels" | "checklist" | "dates" | "cover" | "move" | "copy";

const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export function CardModal({ card, userEmail, onClose }: { card: Card; userEmail: string; onClose: () => void }) {
  const { lists, labelsOf, updateCard, deleteCard } = useBoard();
  const [pop, setPop] = useState<Pop>(null);
  const list = lists.find((l) => l.id === card.list_id);
  const labels = labelsOf(card.id);
  const status = dueStatus(card);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !pop && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, pop]);

  const sideButton = (p: Exclude<Pop, null>, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setPop(pop === p ? null : p)}
      className="flex w-full items-center gap-2 rounded bg-gray-200/70 px-3 py-1.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-300"
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div
      onMouseDown={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 sm:p-4 sm:pt-12"
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="relative min-h-full w-full max-w-3xl bg-[#f1f2f4] text-gray-800 shadow-2xl sm:min-h-0 sm:rounded-xl"
      >
        {card.cover && (
          <div className="h-24 sm:rounded-t-xl" style={{ background: LABEL_COLORS[card.cover] ?? card.cover }} />
        )}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-black/10 p-1.5 hover:bg-black/20"
          aria-label="Close"
        >
          <CloseIcon />
        </button>

        {card.archived && (
          <div className="flex items-center gap-2 bg-[#fff7d6] px-5 py-3 text-sm">
            <ArchiveIcon /> This card is archived.
          </div>
        )}

        <div className="px-5 pb-2 pt-5">
          <InlineEdit
            value={card.title}
            onSave={(t) => updateCard(card.id, { title: t })}
            className="mr-10 w-full break-words rounded px-1 text-xl font-semibold hover:bg-white/60"
            inputClassName="mr-10 w-[calc(100%-2.5rem)] rounded px-1 text-xl font-semibold"
          />
          <p className="px-1 text-sm text-gray-600">
            in list{" "}
            <button onClick={() => setPop("move")} className="underline">
              {list?.title}
            </button>
          </p>
        </div>

        <div className="grid gap-6 px-5 pb-6 md:grid-cols-[1fr_180px]">
          <div className="min-w-0 space-y-6">
            {(labels.length > 0 || card.due_at) && (
              <div className="flex flex-wrap gap-6">
                {labels.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-semibold text-gray-600">Labels</p>
                    <div className="flex flex-wrap gap-1">
                      {labels.map((l) => (
                        <span
                          key={l.id}
                          className="flex h-8 min-w-12 items-center rounded px-3 text-sm font-semibold text-gray-900"
                          style={{ background: LABEL_COLORS[l.color] ?? l.color }}
                        >
                          {l.name}
                        </span>
                      ))}
                      <button
                        onClick={() => setPop("labels")}
                        className="grid h-8 w-8 place-items-center rounded bg-gray-200 hover:bg-gray-300"
                        aria-label="Add label"
                      >
                        <PlusIcon />
                      </button>
                    </div>
                  </div>
                )}
                {card.due_at && status && (
                  <div>
                    <p className="mb-1 text-xs font-semibold text-gray-600">Due date</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={card.due_complete}
                        onChange={(e) => updateCard(card.id, { due_complete: e.target.checked })}
                        className="h-4 w-4"
                        aria-label="Mark due date complete"
                      />
                      <button
                        onClick={() => setPop("dates")}
                        className="flex items-center gap-2 rounded bg-gray-200 px-3 py-1.5 text-sm hover:bg-gray-300"
                      >
                        {formatDue(card.due_at)}
                        {status !== "later" && (
                          <span className={`rounded px-1.5 text-xs ${DUE_STYLES[status]}`}>
                            {status === "complete" ? "Complete" : status === "overdue" ? "Overdue" : "Due soon"}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <Description card={card} />
            <Checklists cardId={card.id} />
            <Activity card={card} userEmail={userEmail} />
          </div>

          <div className="space-y-4">
            <div className="relative space-y-1.5">
              <p className="text-xs font-semibold text-gray-600">Add to card</p>
              {sideButton("labels", <TagIcon />, "Labels")}
              {sideButton("checklist", <CheckSquareIcon />, "Checklist")}
              {sideButton("dates", <CalendarIcon />, "Dates")}
              {sideButton("cover", <ImageIcon />, "Cover")}

              {pop === "labels" && <LabelsPopover card={card} onClose={() => setPop(null)} />}
              {pop === "checklist" && <ChecklistPopover cardId={card.id} onClose={() => setPop(null)} />}
              {pop === "dates" && <DatesPopover card={card} onClose={() => setPop(null)} />}
              {pop === "cover" && <CoverPopover card={card} onClose={() => setPop(null)} />}
            </div>

            <div className="relative space-y-1.5">
              <p className="text-xs font-semibold text-gray-600">Actions</p>
              {sideButton("move", <ArrowRightIcon />, "Move")}
              {sideButton("copy", <CopyIcon />, "Copy")}
              {pop === "move" && <MoveCopyPopover mode="move" card={card} onClose={() => setPop(null)} />}
              {pop === "copy" && <MoveCopyPopover mode="copy" card={card} onClose={() => setPop(null)} />}
              {card.archived ? (
                <>
                  <button
                    onClick={() => updateCard(card.id, { archived: false })}
                    className="flex w-full items-center gap-2 rounded bg-gray-200/70 px-3 py-1.5 text-sm font-medium hover:bg-gray-300"
                  >
                    <ArchiveIcon /> Send to board
                  </button>
                  <button
                    onClick={() => {
                      if (!confirm("Delete this card permanently? This can't be undone.")) return;
                      onClose();
                      deleteCard(card.id);
                    }}
                    className="flex w-full items-center gap-2 rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
                  >
                    <TrashIcon /> Delete
                  </button>
                </>
              ) : (
                <button
                  onClick={() => updateCard(card.id, { archived: true })}
                  className="flex w-full items-center gap-2 rounded bg-gray-200/70 px-3 py-1.5 text-sm font-medium hover:bg-gray-300"
                >
                  <ArchiveIcon /> Archive
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <h3 className="mb-2 flex items-center gap-2 font-semibold">
      {icon}
      {children}
    </h3>
  );
}

function Description({ card }: { card: Card }) {
  const { updateCard } = useBoard();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(card.description);

  return (
    <section>
      <div className="flex items-center justify-between">
        <SectionTitle icon={<TextIcon />}>Description</SectionTitle>
        {card.description && !editing && (
          <button
            onClick={() => {
              setDraft(card.description);
              setEditing(true);
            }}
            className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
          >
            Edit
          </button>
        )}
      </div>
      {editing ? (
        <div>
          <textarea
            autoFocus
            rows={6}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a more detailed description…"
            className="w-full rounded border border-gray-300 bg-white p-2 text-sm outline-none focus:border-[#0c66e4]"
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => {
                updateCard(card.id, { description: draft.trim() });
                setEditing(false);
              }}
              className="rounded bg-[#0c66e4] px-3 py-1.5 text-sm text-white"
            >
              Save
            </button>
            <button onClick={() => setEditing(false)} className="rounded px-3 py-1.5 text-sm hover:bg-gray-200">
              Cancel
            </button>
          </div>
        </div>
      ) : card.description ? (
        <p onClick={() => setEditing(true)} className="cursor-text whitespace-pre-wrap break-words text-sm">
          {card.description}
        </p>
      ) : (
        <button
          onClick={() => {
            setDraft("");
            setEditing(true);
          }}
          className="h-14 w-full rounded bg-gray-200/70 px-3 text-left text-sm text-gray-600 hover:bg-gray-300"
        >
          Add a more detailed description…
        </button>
      )}
    </section>
  );
}

function Checklists({ cardId }: { cardId: string }) {
  const { checklists, items, renameChecklist, deleteChecklist, addItem, updateItem, deleteItem } = useBoard();
  const mine = checklists.filter((k) => k.card_id === cardId).sort((a, b) => a.position - b.position);
  const [hideDone, setHideDone] = useState<Record<string, boolean>>({});
  const [adding, setAdding] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  return (
    <>
      {mine.map((k) => {
        const its = items.filter((i) => i.checklist_id === k.id).sort((a, b) => a.position - b.position);
        const done = its.filter((i) => i.done).length;
        const pct = its.length ? Math.round((done / its.length) * 100) : 0;
        const visible = hideDone[k.id] ? its.filter((i) => !i.done) : its;
        return (
          <section key={k.id}>
            <div className="mb-2 flex items-center gap-2">
              <CheckSquareIcon />
              <InlineEdit
                value={k.title}
                onSave={(t) => renameChecklist(k.id, t)}
                className="flex-1 rounded px-1 font-semibold hover:bg-white/60"
                inputClassName="flex-1 rounded px-1 font-semibold"
              />
              {done > 0 && (
                <button
                  onClick={() => setHideDone((h) => ({ ...h, [k.id]: !h[k.id] }))}
                  className="rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300"
                >
                  {hideDone[k.id] ? `Show checked items (${done})` : "Hide checked items"}
                </button>
              )}
              <button
                onClick={() => confirm("Delete this checklist?") && deleteChecklist(k.id)}
                className="rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300"
              >
                Delete
              </button>
            </div>
            <div className="mb-2 flex items-center gap-2">
              <span className="w-8 text-xs text-gray-600">{pct}%</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-300">
                <div
                  className={`h-full transition-all ${pct === 100 ? "bg-[#1f845a]" : "bg-[#0c66e4]"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            {visible.map((i) => (
              <div key={i.id} className="group flex items-start gap-2 rounded px-1 py-1 hover:bg-gray-200/60">
                <input
                  type="checkbox"
                  checked={i.done}
                  onChange={(e) => updateItem(i.id, { done: e.target.checked })}
                  className="mt-1.5 h-4 w-4"
                  aria-label={`Mark "${i.title}" done`}
                />
                <InlineEdit
                  value={i.title}
                  onSave={(t) => updateItem(i.id, { title: t })}
                  className={`flex-1 break-words rounded px-1 py-0.5 text-sm ${i.done ? "text-gray-500 line-through" : ""}`}
                  inputClassName="flex-1 rounded px-1 py-0.5 text-sm"
                />
                <button
                  onClick={() => deleteItem(i.id)}
                  className="rounded p-1 text-gray-500 opacity-0 hover:bg-gray-300 group-hover:opacity-100"
                  aria-label="Delete item"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {adding === k.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!draft.trim()) return;
                  addItem(k.id, draft.trim());
                  setDraft("");
                }}
                className="ml-7 mt-1"
              >
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Escape" && (e.stopPropagation(), setAdding(null))}
                  placeholder="Add an item"
                  className="mb-2 w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-[#0c66e4]"
                />
                <div className="flex gap-2">
                  <button className="rounded bg-[#0c66e4] px-3 py-1.5 text-sm text-white">Add</button>
                  <button type="button" onClick={() => setAdding(null)} className="rounded px-3 py-1.5 text-sm hover:bg-gray-200">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => {
                  setDraft("");
                  setAdding(k.id);
                }}
                className="ml-7 mt-1 rounded bg-gray-200 px-3 py-1.5 text-sm hover:bg-gray-300"
              >
                Add an item
              </button>
            )}
          </section>
        );
      })}
    </>
  );
}

function Activity({ card, userEmail }: { card: Card; userEmail: string }) {
  const { supabase, adjustCommentCount } = useBoard();
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const initials = userEmail.slice(0, 2).toUpperCase();

  useEffect(() => {
    let live = true;
    supabase
      .from("comments")
      .select("id, card_id, author_id, body, created_at")
      .eq("card_id", card.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => live && setComments(data ?? []));
    return () => {
      live = false;
    };
  }, [card.id, supabase]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    const { data, error } = await supabase
      .from("comments")
      .insert({ card_id: card.id, board_id: card.board_id, body })
      .select("id, card_id, author_id, body, created_at")
      .single<Comment>();
    if (error) return alert(error.message);
    setComments((cs) => [data, ...(cs ?? [])]);
    adjustCommentCount(card.id, 1);
  }

  async function save(id: string) {
    const body = editDraft.trim();
    if (!body) return;
    setEditingId(null);
    setComments((cs) => cs?.map((c) => (c.id === id ? { ...c, body } : c)) ?? null);
    const { error } = await supabase.from("comments").update({ body }).eq("id", id);
    if (error) alert(error.message);
  }

  async function remove(id: string) {
    if (!confirm("Delete this comment?")) return;
    setComments((cs) => cs?.filter((c) => c.id !== id) ?? null);
    adjustCommentCount(card.id, -1);
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) alert(error.message);
  }

  const avatar = (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#1f845a] text-xs font-bold text-white">
      {initials}
    </span>
  );

  return (
    <section>
      <SectionTitle icon={<CommentIcon />}>Activity</SectionTitle>
      <form onSubmit={add} className="mb-4 flex gap-2">
        {avatar}
        <div className="flex-1">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) add(e);
            }}
            rows={draft ? 3 : 1}
            placeholder="Write a comment…"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#0c66e4]"
          />
          {draft && <button className="mt-1 rounded bg-[#0c66e4] px-3 py-1.5 text-sm text-white">Save</button>}
        </div>
      </form>

      {comments === null && <p className="text-sm text-gray-500">Loading…</p>}
      {comments?.map((c) => (
        <div key={c.id} className="mb-3 flex gap-2">
          {avatar}
          <div className="min-w-0 flex-1">
            <p className="text-sm">
              <span className="font-semibold">{userEmail}</span>{" "}
              <span className="text-xs text-gray-500">{new Date(c.created_at).toLocaleString()}</span>
            </p>
            {editingId === c.id ? (
              <div>
                <textarea
                  autoFocus
                  value={editDraft}
                  onChange={(e) => setEditDraft(e.target.value)}
                  className="w-full rounded border border-gray-300 bg-white p-2 text-sm"
                />
                <div className="flex gap-2">
                  <button onClick={() => save(c.id)} className="rounded bg-[#0c66e4] px-3 py-1 text-sm text-white">
                    Save
                  </button>
                  <button onClick={() => setEditingId(null)} className="rounded px-3 py-1 text-sm hover:bg-gray-200">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="whitespace-pre-wrap break-words rounded-lg bg-white px-3 py-2 text-sm shadow-sm">{c.body}</p>
                <div className="mt-0.5 flex gap-2 text-xs text-gray-600">
                  <button
                    onClick={() => {
                      setEditDraft(c.body);
                      setEditingId(c.id);
                    }}
                    className="flex items-center gap-1 underline"
                  >
                    <PencilIcon className="h-3 w-3" /> Edit
                  </button>
                  <button onClick={() => remove(c.id)} className="underline">
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}

function LabelsPopover({ card, onClose }: { card: Card; onClose: () => void }) {
  const { labels, labelsOf, toggleCardLabel, createLabel, updateLabel, deleteLabel } = useBoard();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Label | "new" | null>(null);
  const on = new Set(labelsOf(card.id).map((l) => l.id));
  const shown = labels.filter((l) => (l.name || l.color).toLowerCase().includes(q.toLowerCase()));

  return (
    <Popover title={editing ? (editing === "new" ? "Create label" : "Edit label") : "Labels"} onClose={onClose}>
      {editing ? (
        <LabelEditor
          label={editing === "new" ? undefined : editing}
          onCancel={() => setEditing(null)}
          onSave={async (name, color) => {
            if (editing === "new") {
              const l = await createLabel(name, color);
              await toggleCardLabel(card.id, l.id);
            } else updateLabel(editing.id, { name, color });
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
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search labels…"
            className="mb-2 w-full rounded border border-gray-300 px-2 py-1.5 outline-none focus:border-[#0c66e4]"
          />
          <div className="max-h-64 overflow-y-auto">
            {shown.map((l) => (
              <div key={l.id} className="mb-1 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={on.has(l.id)}
                  onChange={() => toggleCardLabel(card.id, l.id)}
                  className="h-4 w-4"
                  aria-label={`Toggle label ${l.name || l.color}`}
                />
                <button
                  onClick={() => toggleCardLabel(card.id, l.id)}
                  className="flex h-8 flex-1 items-center rounded px-3 text-left text-sm font-semibold text-gray-900 hover:brightness-95"
                  style={{ background: LABEL_COLORS[l.color] ?? l.color }}
                >
                  {l.name}
                </button>
                <button onClick={() => setEditing(l)} className="rounded p-1.5 hover:bg-gray-100" aria-label="Edit label">
                  <PencilIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <button onClick={() => setEditing("new")} className="mt-2 w-full rounded bg-gray-100 py-1.5 hover:bg-gray-200">
            Create a new label
          </button>
        </>
      )}
    </Popover>
  );
}

function ChecklistPopover({ cardId, onClose }: { cardId: string; onClose: () => void }) {
  const { addChecklist } = useBoard();
  const [title, setTitle] = useState("Checklist");
  return (
    <Popover title="Add checklist" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          addChecklist(cardId, title.trim());
          onClose();
        }}
      >
        <label className="mb-1 block text-xs font-semibold text-gray-600">Title</label>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={(e) => e.target.select()}
          className="mb-3 w-full rounded border border-gray-300 px-2 py-1.5 outline-none focus:border-[#0c66e4]"
        />
        <button className="rounded bg-[#0c66e4] px-3 py-1.5 text-white">Add</button>
      </form>
    </Popover>
  );
}

function DatesPopover({ card, onClose }: { card: Card; onClose: () => void }) {
  const { updateCard } = useBoard();
  const defaultDue = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(12, 0, 0, 0);
    return d.toISOString();
  };
  const [value, setValue] = useState(toLocalInput(card.due_at ?? defaultDue()));

  return (
    <Popover title="Dates" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!value) return;
          updateCard(card.id, { due_at: new Date(value).toISOString() });
          onClose();
        }}
      >
        <label className="mb-1 block text-xs font-semibold text-gray-600">Due date</label>
        <input
          type="datetime-local"
          required
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mb-3 w-full rounded border border-gray-300 px-2 py-1.5 outline-none focus:border-[#0c66e4]"
        />
        <button className="mb-2 w-full rounded bg-[#0c66e4] py-1.5 text-white">Save</button>
        {card.due_at && (
          <button
            type="button"
            onClick={() => {
              updateCard(card.id, { due_at: null, due_complete: false });
              onClose();
            }}
            className="w-full rounded bg-gray-100 py-1.5 hover:bg-gray-200"
          >
            Remove
          </button>
        )}
      </form>
    </Popover>
  );
}

function CoverPopover({ card, onClose }: { card: Card; onClose: () => void }) {
  const { updateCard } = useBoard();
  return (
    <Popover title="Cover" onClose={onClose}>
      <p className="mb-1 text-xs font-semibold text-gray-600">Colors</p>
      <div className="mb-3 grid grid-cols-5 gap-1.5">
        {Object.entries(LABEL_COLORS).map(([key, hex]) => (
          <button
            key={key}
            onClick={() => updateCard(card.id, { cover: key })}
            style={{ background: hex }}
            aria-label={`Cover ${key}`}
            className={`h-8 rounded ${card.cover === key ? "ring-2 ring-[#0c66e4] ring-offset-1" : ""}`}
          />
        ))}
      </div>
      {card.cover && (
        <button
          onClick={() => updateCard(card.id, { cover: null })}
          className="w-full rounded bg-gray-100 py-1.5 hover:bg-gray-200"
        >
          Remove cover
        </button>
      )}
    </Popover>
  );
}

function MoveCopyPopover({ mode, card, onClose }: { mode: "move" | "copy"; card: Card; onClose: () => void }) {
  const { activeLists, cardsIn, moveCard, copyCard } = useBoard();
  const [listId, setListId] = useState(activeLists.some((l) => l.id === card.list_id) ? card.list_id : activeLists[0]?.id);
  const [title, setTitle] = useState(card.title);
  const inTarget = listId ? cardsIn(listId) : [];
  const current = inTarget.findIndex((c) => c.id === card.id);
  // Moving within the same list has one fewer slot than moving elsewhere.
  const slots = mode === "move" && current >= 0 ? inTarget.length : inTarget.length + 1;
  const [index, setIndex] = useState(current >= 0 && mode === "move" ? current : slots - 1);

  if (!listId) {
    return (
      <Popover title={mode === "move" ? "Move card" : "Copy card"} onClose={onClose}>
        <p className="text-gray-500">Create a list first.</p>
      </Popover>
    );
  }

  return (
    <Popover title={mode === "move" ? "Move card" : "Copy card"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (mode === "move") {
            moveCard(card.id, listId, index);
          } else {
            if (!title.trim()) return;
            copyCard(card.id, listId, index, title.trim());
          }
          onClose();
        }}
      >
        {mode === "copy" && (
          <>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Title</label>
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-3 w-full rounded border border-gray-300 p-2"
            />
            <p className="mb-2 text-xs text-gray-500">Labels, checklists, dates and cover are copied too.</p>
          </>
        )}
        <div className="mb-3 grid grid-cols-[1fr_80px] gap-2">
          <label className="text-xs font-semibold text-gray-600">
            List
            <select
              value={listId}
              onChange={(e) => {
                setListId(e.target.value);
                const n = cardsIn(e.target.value).filter((c) => c.id !== card.id).length;
                setIndex(n);
              }}
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 font-normal"
            >
              {activeLists.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-gray-600">
            Position
            <select
              value={index}
              onChange={(e) => setIndex(Number(e.target.value))}
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 font-normal"
            >
              {Array.from({ length: slots }, (_, i) => (
                <option key={i} value={i}>
                  {i + 1}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button className="rounded bg-[#0c66e4] px-4 py-1.5 text-white">{mode === "move" ? "Move" : "Create card"}</button>
      </form>
    </Popover>
  );
}
