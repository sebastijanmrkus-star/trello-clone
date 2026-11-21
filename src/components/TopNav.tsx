import Link from "next/link";
import { getCurrentTeam, getTeams, getUser, getWorkspaces } from "@/lib/data";
import { SearchBox } from "./SearchBox";
import { CreateBoardButton } from "./CreateBoardDialog";
import { UserMenu } from "./UserMenu";
import { TeamSwitcher } from "./TeamSwitcher";
import { APP_NAME, LogoMark } from "./Logo";

export async function TopNav({ dark }: { dark?: boolean }) {
  const [user, workspaces, teams, current] = await Promise.all([getUser(), getWorkspaces(), getTeams(), getCurrentTeam()]);

  return (
    <header
      className={`sticky top-0 z-40 flex h-12 items-center gap-3 border-b px-3 ${
        dark ? "border-white/20 bg-black/30 text-white backdrop-blur" : "border-gray-200 bg-white text-gray-800"
      }`}
    >
      <Link href="/" className="flex items-center gap-1.5 rounded px-1.5 py-1 font-bold hover:bg-black/5">
        <LogoMark />
        <span className="hidden sm:inline">{APP_NAME}</span>
      </Link>
      <TeamSwitcher teams={teams} currentId={current?.id} dark={dark} />

      <div className="flex flex-1 items-center justify-center gap-2">
        <SearchBox dark={dark} />
        <CreateBoardButton workspaces={workspaces} defaultWorkspaceId={current?.id} />
      </div>

      <UserMenu email={user?.email ?? ""} />
    </header>
  );
}
