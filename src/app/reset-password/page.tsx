import { redirect } from "next/navigation";
import { getUser } from "@/lib/data";
import { AuthLayout } from "@/components/AuthLayout";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { isDemoEmail } from "@/lib/demo";

// Reached from the email link: /auth/confirm signs the person in with a
// recovery session and sends them here to choose a new password.
export default async function ResetPasswordPage() {
  const user = await getUser();
  if (!user) redirect("/login?error=" + encodeURIComponent("Your reset link has expired. Request a new one."));
  return (
    <AuthLayout>
      <ResetPasswordForm email={user.email ?? ""} demo={isDemoEmail(user.email)} />
    </AuthLayout>
  );
}
