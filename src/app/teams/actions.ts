"use server";

import { cookies } from "next/headers";
import { TEAM_COOKIE } from "@/lib/data";

// Remembers which team the boards page shows.
export async function switchTeam(teamId: string) {
  (await cookies()).set(TEAM_COOKIE, teamId, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
}
