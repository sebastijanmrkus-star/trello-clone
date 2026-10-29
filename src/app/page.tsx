import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";
import { CreateBoard } from "@/components/CreateBoard";
import type { Board } from "@/lib/types";

export default async function BoardsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: boards } = await supabase
    .from("boards")
    .select("id, title, color, created_at")
    .order("created_at")
    .returns<Board[]>();

  return (
    <>
      <Header email={user?.email} />
      <main className="mx-auto max-w-5xl p-6">
        <h2 className="mb-4 text-lg font-bold">Your boards</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {boards?.map((b) => (
            <Link
              key={b.id}
              href={`/b/${b.id}`}
              style={{ background: b.color }}
              className="h-24 rounded-md p-3 font-bold text-white shadow hover:brightness-90"
            >
              {b.title}
            </Link>
          ))}
          <CreateBoard />
        </div>
      </main>
    </>
  );
}
