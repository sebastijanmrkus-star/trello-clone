import { getBoards, getWorkspaces } from "@/lib/data";
import { TopNav } from "./TopNav";
import { Sidebar } from "./Sidebar";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const [workspaces, boards] = await Promise.all([getWorkspaces(), getBoards()]);
  return (
    <div className="min-h-screen bg-white">
      <TopNav />
      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8 md:px-6">
        <Sidebar workspaces={workspaces} boards={boards} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
