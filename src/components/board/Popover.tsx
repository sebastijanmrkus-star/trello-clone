"use client";

import { useEffect, useRef } from "react";
import { CloseIcon } from "../Icons";

// Small floating panel anchored under its trigger; closes on outside click or Escape.
export function Popover({
  title,
  onClose,
  children,
  align = "left",
  className = "",
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && onClose();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      onClick={(e) => e.stopPropagation()}
      className={`absolute top-full z-50 mt-1 w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-800 shadow-xl ${
        align === "right" ? "right-0" : "left-0"
      } ${className}`}
    >
      <div className="relative mb-2 text-center text-sm font-semibold text-gray-600">
        {title}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-1 right-0 rounded p-1 hover:bg-gray-100"
          aria-label="Close"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>
      {children}
    </div>
  );
}

export function PopoverButton({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full rounded px-2 py-1.5 text-left hover:bg-gray-100 ${danger ? "text-red-600" : ""}`}
    >
      {children}
    </button>
  );
}
