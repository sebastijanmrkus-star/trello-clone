import Link from "next/link";
import { getWorkspaces } from "@/lib/data";
import { TEMPLATE_CATEGORIES, templatesFor, type CategorySlug } from "@/lib/templates";
import { AppShell } from "@/components/AppShell";
import { TemplateCard } from "@/components/TemplateCard";
import { TemplateIcon } from "@/components/Icons";

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; template?: string }>;
}) {
  const { category: raw, template: openId } = await searchParams;
  const category: CategorySlug = TEMPLATE_CATEGORIES.some((c) => c.slug === raw) ? (raw as CategorySlug) : "popular";
  const workspaces = await getWorkspaces();
  const current = TEMPLATE_CATEGORIES.find((c) => c.slug === category)!;

  return (
    <AppShell>
      <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold">
        <TemplateIcon className="h-6 w-6" /> Templates
      </h1>
      <p className="mb-5 text-sm text-gray-600">Start a new board from a ready-made layout.</p>

      <nav className="mb-6 flex flex-wrap gap-2" aria-label="Template categories">
        {TEMPLATE_CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/templates?category=${c.slug}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              c.slug === category ? "bg-[#0c66e4] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </nav>

      <h2 className="mb-4 font-bold">{current.name} templates</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templatesFor(category).map((t) => (
          <TemplateCard key={t.id} template={t} workspaces={workspaces} initiallyOpen={t.id === openId} />
        ))}
      </div>
    </AppShell>
  );
}
