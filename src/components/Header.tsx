import Link from "next/link";

export function Header({ email }: { email?: string }) {
  return (
    <header className="flex items-center justify-between bg-[#026aa7] px-4 py-2 text-white">
      <Link href="/" className="text-lg font-bold tracking-tight">
        Trello Clone
      </Link>
      <div className="flex items-center gap-3 text-sm">
        {email && <span className="opacity-80">{email}</span>}
        <form action="/auth/signout" method="post">
          <button className="rounded bg-white/20 px-3 py-1 hover:bg-white/30">Sign out</button>
        </form>
      </div>
    </header>
  );
}
