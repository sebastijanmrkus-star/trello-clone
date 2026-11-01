import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/safe-next";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // Optional `next`: where to go after signing in again (e.g. the page they were on).
  const next = safeNext(((await request.formData().catch(() => null))?.get("next") as string | null) ?? null, "");
  const login = new URL("/login", request.url);
  if (next) login.searchParams.set("next", next);
  return NextResponse.redirect(login, { status: 303 });
}
