"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Render ids this tab has already displayed. A repeat means Next.js replayed a
// cached page (back/forward or its client Router Cache), which can predate
// changes made since, so ask the server for fresh data.
const seen = new Set<string>();

export function RefreshIfStale({ renderId }: { renderId: string }) {
  const router = useRouter();

  useEffect(() => {
    if (seen.has(renderId)) router.refresh();
    else seen.add(renderId);
  }, [renderId, router]);

  return null;
}
