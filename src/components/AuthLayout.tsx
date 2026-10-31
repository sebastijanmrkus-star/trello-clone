// Unsplash photo by Annie Spratt (free to use under the Unsplash License).
const TEAM_PHOTO = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80";

// Photo panel plus a card for the sign-in, password and invitation pages.
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen bg-gradient-to-br from-[#0079bf] to-[#5067c5]">
      {/* Team photo: a side panel on wide screens, the backdrop behind the form on phones. */}
      <div
        role="img"
        aria-label="A team collaborating around their laptops"
        className="fixed inset-0 bg-cover bg-center lg:relative lg:inset-auto lg:block lg:flex-1"
        style={{ backgroundImage: `url(${TEAM_PHOTO})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#091e42]/85 via-[#091e42]/40 to-[#0079bf]/30" />
        <div className="absolute bottom-0 left-0 right-0 hidden p-12 text-white lg:block">
          <p className="text-3xl font-bold leading-tight">Plan together. Ship together.</p>
          <p className="mt-2 max-w-md text-white/85">Boards, lists and cards that keep your whole team on the same page.</p>
        </div>
      </div>

      <div className="relative flex w-full items-center justify-center overflow-y-auto p-4 lg:w-[480px] lg:shrink-0 lg:bg-[#f7f8f9]">
        <div className="my-auto w-full max-w-sm space-y-4 rounded-lg bg-white p-8 shadow-xl">
          <div className="flex items-center justify-center gap-2 text-[#0079bf]">
            <span className="grid h-8 w-8 place-items-center rounded bg-[#0079bf] text-white">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                <rect x="4" y="4" width="7" height="14" rx="1.5" />
                <rect x="13" y="4" width="7" height="9" rx="1.5" />
              </svg>
            </span>
            <span className="text-xl font-bold">Trello Clone</span>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}

export const authInput =
  "w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-[#0079bf]";
export const authButton =
  "w-full rounded bg-[#0079bf] py-2 font-semibold text-white hover:bg-[#026aa7] disabled:cursor-not-allowed disabled:opacity-60";
