"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { StarIcon } from "./Icons";

export function StarButton({ boardId, starred, className }: { boardId: string; starred: boolean; className?: string }) {
  const router = useRouter();
  const [on, setOn] = useState(starred);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !on;
    setOn(next);
    const { error } = await createClient().from("boards").update({ starred: next }).eq("id", boardId);
    if (error) {
      setOn(!next);
      return alert(error.message);
    }
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      aria-label={on ? "Unstar board" : "Star board"}
      aria-pressed={on}
      className={className}
    >
      <StarIcon filled={on} className={`h-4 w-4 ${on ? "text-[#f5cd47]" : ""}`} />
    </button>
  );
}
