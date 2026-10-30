import { getBoards, getUser, getWorkspaces } from "@/lib/data";
import { AppShell } from "@/components/AppShell";
import { BoardGrid, BoardTile } from "@/components/BoardTile";
import { CreateBoardTile } from "@/components/CreateBoardDialog";
import { TemplatesShowcase } from "@/components/TemplatesShowcase";
import { WorkspaceAvatar } from "@/components/Sidebar";
import { ClockIcon, StarIcon, UsersIcon } from "@/components/Icons";

export default async function BoardsPage() {
  const [workspaces, allBoards, user] = await Promise.all([getWorkspaces(), getBoards(), getUser()]);

  // Stars and "recently viewed" are the owner's own settings, so they only cover your boards.
  const boards = allBoards.filter((b) => b.owner_id === user?.id);
  const shared = allBoards.filter((b) => b.owner_id !== user?.id);
  const starred = boards.filter((b) => b.starred);
  const recent = boards
    .filter((b) => b.last_viewed_at)
    .sort((a, b) => b.last_viewed_at!.localeCompare(a.last_viewed_at!))
    .slice(0, 4);

  return (
    <AppShell>
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

      <section>
        <h2 className="mb-4 text-sm font-bold uppercase text-gray-600">Your workspaces</h2>
        {workspaces.length === 0 && <p className="text-sm text-gray-500">No workspaces yet.</p>}
        {workspaces.map((w) => (
          <div key={w.id} className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <WorkspaceAvatar name={w.name} size="lg" />
              <h3 className="font-bold">{w.name}</h3>
            </div>
            <BoardGrid>
              {boards
                .filter((b) => b.workspace_id === w.id)
                .map((b) => (
                  <BoardTile key={b.id} board={b} />
                ))}
              <CreateBoardTile workspaces={workspaces} workspaceId={w.id} />
            </BoardGrid>
          </div>
        ))}
      </section>
    </AppShell>
  );
}
