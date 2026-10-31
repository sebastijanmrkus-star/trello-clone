import Link from "next/link";
import { getBoards, getCurrentTeam, getTeams, getUser, getWorkspaces } from "@/lib/data";
import { AppShell } from "@/components/AppShell";
import { BoardGrid, BoardTile } from "@/components/BoardTile";
import { CreateBoardTile } from "@/components/CreateBoardDialog";
import { TemplatesShowcase } from "@/components/TemplatesShowcase";
import { WorkspaceAvatar } from "@/components/Sidebar";
import { ClockIcon, StarIcon, UsersIcon } from "@/components/Icons";

export default async function BoardsPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const [{ notice }, workspaces, teams, team, allBoards, user] = await Promise.all([
    searchParams,
    getWorkspaces(),
    getTeams(),
    getCurrentTeam(),
    getBoards(),
    getUser(),
  ]);

  // Stars and "recently viewed" are the owner's own settings, so they only cover your boards.
  const boards = allBoards.filter((b) => b.owner_id === user?.id);
  const teamIds = new Set(teams.map((t) => t.id));
  const shared = allBoards.filter((b) => !teamIds.has(b.workspace_id));
  const teamBoards = team ? allBoards.filter((b) => b.workspace_id === team.id) : [];
  const starred = boards.filter((b) => b.starred);
  const recent = boards
    .filter((b) => b.last_viewed_at)
    .sort((a, b) => b.last_viewed_at!.localeCompare(a.last_viewed_at!))
    .slice(0, 4);

  return (
    <AppShell>
      {notice && (
        <p role="status" className="mb-6 rounded-lg bg-[#dcfff1] px-4 py-3 text-sm text-[#164b35]">
          {notice}
        </p>
      )}

      <TemplatesShowcase workspaces={workspaces} />

      {starred.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 font-bold">
            <StarIcon className="h-5 w-5" /> Starred boards
          </h2>
          <BoardGrid>
            {starred.map((b) => (
              <BoardTile key={b.id} board={b} />
            ))}
          </BoardGrid>
        </section>
      )}

      {recent.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 font-bold">
            <ClockIcon className="h-5 w-5" /> Recently viewed
          </h2>
          <BoardGrid>
            {recent.map((b) => (
              <BoardTile key={b.id} board={b} />
            ))}
          </BoardGrid>
        </section>
      )}

      {team ? (
        <section className="mb-10">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <WorkspaceAvatar name={team.name} size="lg" />
            <h2 className="font-bold">{team.name}</h2>
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {team.role === "admin" ? "Admin" : "Member"}
            </span>
            <Link
              href={`/teams/${team.id}`}
              className="ml-auto flex items-center gap-1.5 rounded bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200"
            >
              <UsersIcon /> {team.role === "admin" ? "Manage team" : "Members"}
            </Link>
          </div>
          <BoardGrid>
            {teamBoards.map((b) => (
              <BoardTile key={b.id} board={b} canStar={b.owner_id === user?.id} />
            ))}
            <CreateBoardTile workspaces={workspaces} workspaceId={team.id} />
          </BoardGrid>
          {teams.length > 1 && (
            <p className="mt-3 text-xs text-gray-500">
              You&apos;re in {teams.length} teams. Use the team switcher at the top to see the others.
            </p>
          )}
        </section>
      ) : (
        <p className="mb-10 text-sm text-gray-500">You&apos;re not in any team yet. Create one from the team switcher.</p>
      )}

      {shared.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 font-bold">
            <UsersIcon className="h-5 w-5" /> Shared with you
          </h2>
          <BoardGrid>
            {shared.map((b) => (
              <BoardTile key={b.id} board={b} canStar={false} />
            ))}
          </BoardGrid>
        </section>
      )}
    </AppShell>
  );
}
