"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { switchTeam } from "@/app/teams/actions";
import { authButton } from "@/components/AuthLayout";

export function AcceptInvitation({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function accept() {
    setBusy(true);
    setError(null);
    const { data: teamId, error } = await createClient().rpc("accept_invitation", { p_token: token });
    if (error) {
      setBusy(false);
      return setError(error.message);
    }
    await switchTeam(teamId as string);
    router.replace("/");
    router.refresh();
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-2 text-sm text-red-600">
          {error}
        </p>
      )}
      <button onClick={accept} disabled={busy} className={authButton}>
        {busy ? "Joining…" : "Accept invitation"}
      </button>
    </div>
  );
}
