import Link from "next/link";
import { getUser, getWorkspaces } from "@/lib/data";
import { SearchBox } from "./SearchBox";
import { CreateBoardButton } from "./CreateBoardDialog";
import { UserMenu } from "./UserMenu";

export async function TopNav({ dark }: { dark?: boolean }) {
  const [user, workspaces] = await Promise.all([getUser(), getWorkspaces()]);

  return (
    <header
      className={`sticky top-0 z-40 flex h-12 items-center gap-3 border-b px-3 ${
        dark ? "border-white/20 bg-black/30 text-white backdrop-blur" : "border-gray-200 bg-white text-gray-800"
      }`}
    >
      <Link href="/" className="flex items-center gap-1.5 rounded px-1.5 py-1 font-bold hover:bg-black/5">
        <span className="grid h-6 w-6 place-items-center rounded bg-[#0c66e4] text-white">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
            <rect x="4" y="4" width="6.5" height="14" rx="1.5" />
            <rect x="13.5" y="4" width="6.5" height="9" rx="1.5" />
          </svg>
        </span>
        <span className="hidden sm:inline">Trello Clone</span>
      </Link>

      <div className="flex flex-1 items-center justify-center gap-2">
        <SearchBox dark={dark} />
        <CreateBoardButton workspaces={workspaces} />
      </div>

      <UserMenu email={user?.email ?? ""} />
    </header>
  );
}
