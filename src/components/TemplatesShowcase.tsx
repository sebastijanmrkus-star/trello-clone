"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TEMPLATE_CATEGORIES, templatesFor, type CategorySlug } from "@/lib/templates";
import type { Workspace } from "@/lib/types";
import { CloseIcon, TemplateIcon } from "./Icons";
import { TemplateCard } from "./TemplateCard";

const HIDE_KEY = "hideTemplatesShowcase";

export function TemplatesShowcase({ workspaces }: { workspaces: Workspace[] }) {
  const [hidden, setHidden] = useState(false);
  const [category, setCategory] = useState<CategorySlug>("popular");

  useEffect(() => {
    try {
      setHidden(localStorage.getItem(HIDE_KEY) === "1");
    } catch {}
  }, []);

  if (hidden) return null;

  function hide() {
    setHidden(true);
    try {
      localStorage.setItem(HIDE_KEY, "1");
    } catch {}
  }

  return (
    <section className="mb-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <TemplateIcon className="h-5 w-5" /> Most popular templates
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span>Get going faster with a template from the Trello Clone community or</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategorySlug)}
              aria-label="Template category"
              className="rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-800"
            >
              {TEMPLATE_CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button onClick={hide} className="rounded border border-gray-300 p-1.5 hover:bg-gray-100" aria-label="Hide templates">
          <CloseIcon />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {templatesFor(category)
          .slice(0, 4)
          .map((t) => (
            <TemplateCard key={t.id} template={t} workspaces={workspaces} />
          ))}
      </div>
      <Link href={`/templates?category=${category}`} className="mt-4 inline-block text-sm text-[#0c66e4] underline">
        Browse the full template gallery
      </Link>
    </section>
  );
}
