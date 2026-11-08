import { redirect } from "next/navigation";
import { PasswordUpdateForm } from "@/components/auth/password-recovery-forms";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { isSupabaseConfigured } from "@/lib/env/client";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage() {
  if (!isSupabaseConfigured()) redirect("/login");
  const { data: { user } } = await (await createClient()).auth.getUser();
  if (!user) redirect("/login?error=recovery_required");

  return <main className="relative grid min-h-screen place-items-center bg-background p-4 sm:p-6"><ThemeToggle className="absolute right-4 top-4 sm:right-6 sm:top-6" /><section className="w-full max-w-md space-y-8 rounded-lg border bg-card p-6 shadow-sm sm:p-8"><div className="space-y-2"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Jahan School</p><h1 className="text-3xl font-semibold tracking-tight">Choose a new password</h1><p className="text-sm leading-6 text-muted-foreground">Choose a password with at least 8 characters. You will be signed out after saving it.</p></div><PasswordUpdateForm /></section></main>;
}
