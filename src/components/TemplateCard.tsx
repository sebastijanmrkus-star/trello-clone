"use client";

import { useState } from "react";
import type { Template } from "@/lib/templates";
import type { Workspace } from "@/lib/types";
import { TemplateIcon } from "./Icons";
import { TemplateModal } from "./TemplateModal";

export function TemplateCard({
  template,
  workspaces,
  initiallyOpen = false,
}: {
  template: Template;
  workspaces: Workspace[];
  initiallyOpen?: boolean;
}) {
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white text-left shadow-sm hover:shadow-md"
      >
        <div className="relative h-20 w-full shrink-0" style={{ background: template.background }}>
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded bg-white/90 px-1.5 py-0.5 text-[11px] font-semibold text-gray-700">
            <TemplateIcon className="h-3 w-3" /> Template
          </span>
        </div>
        <div className="w-full px-3 py-2.5">
          <p className="truncate text-sm font-medium text-gray-800">{template.title}</p>
          <p className="line-clamp-2 text-xs text-gray-500">{template.description}</p>
        </div>
      </button>
      {open && <TemplateModal template={template} workspaces={workspaces} onClose={() => setOpen(false)} />}
    </>
  );
}
