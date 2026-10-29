"use client";

import { useState } from "react";

export function InlineEdit({
  value,
  onSave,
  className,
  inputClassName,
}: {
  value: string;
  onSave: (v: string) => void;
  className?: string;
  inputClassName?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function commit() {
    setEditing(false);
    const v = draft.trim();
    if (v && v !== value) onSave(v);
    else setDraft(value);
  }

  if (!editing) {
    const start = () => {
      setDraft(value);
      setEditing(true);
    };
    // A div rather than a <button>: drag-and-drop ignores drags that start on
    // buttons, and list titles must work as drag handles.
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={start}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            start();
          }
        }}
        className={`cursor-pointer text-left ${className ?? ""}`}
      >
        {value}
      </div>
    );
  }

  return (
    <input
      autoFocus
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") {
          setDraft(value);
          setEditing(false);
        }
      }}
      className={inputClassName}
    />
  );
}
