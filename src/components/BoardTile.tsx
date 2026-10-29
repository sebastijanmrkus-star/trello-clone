import Link from "next/link";
import type { Board } from "@/lib/types";
import { StarButton } from "./StarButton";

export function BoardTile({ board }: { board: Board }) {
  return (
    <Link
      href={`/b/${board.id}`}
      className="group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md"
    >
      <div className="relative h-20" style={{ background: board.background }}>
        <StarButton
          boardId={board.id}
          starred={board.starred}
          className={`absolute right-2 top-2 rounded bg-black/30 p-1 text-white hover:bg-black/50 ${
            board.starred ? "" : "opacity-0 focus:opacity-100 group-hover:opacity-100"
          }`}
        />
      </div>
      <p className="truncate px-3 py-2.5 text-sm font-medium text-gray-800">{board.title}</p>
    </Link>
  );
}

export function BoardGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>;
}
