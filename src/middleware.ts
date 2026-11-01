import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  // Pages for signed-out people; signed-in people are sent on to the app.
  const isAuthPage = path.startsWith("/login") || path.startsWith("/forgot-password");
  if (!user && !isAuthPage) {
    // Remember where they were going so sign-in can bring them back.
    const login = new URL("/login", request.url);
    const next = path + request.nextUrl.search;
    if (next !== "/") login.searchParams.set("next", next);
    return NextResponse.redirect(login);
  }
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|auth/).*)"],
};
