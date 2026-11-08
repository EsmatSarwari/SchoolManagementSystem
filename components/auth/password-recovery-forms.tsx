"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isSupabaseConfigured } from "@/lib/env/client";
import { createClient } from "@/lib/supabase/browser";

const emailSchema = z.object({ email: z.email("Enter a valid email address.") });
const passwordSchema = z.object({
  password: z.string().min(8, "Use at least 8 characters.").max(72, "Use 72 characters or fewer."),
  confirmPassword: z.string(),
}).refine((values) => values.password === values.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type EmailValues = z.infer<typeof emailSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export function PasswordRecoveryRequestForm() {
  const [submitted, setSubmitted] = useState(false);
  const configured = isSupabaseConfigured();
  const form = useForm<EmailValues>({ resolver: zodResolver(emailSchema), defaultValues: { email: "" } });

  async function onSubmit(values: EmailValues) {
    if (!configured) { toast.error("Authentication is not configured yet."); return; }

    const redirectTo = new URL("/auth/callback?next=/reset-password", window.location.origin).toString();
    const { error } = await createClient().auth.resetPasswordForEmail(values.email, { redirectTo });
    if (error) { toast.error("We could not send the reset email. Please try again later."); return; }
    setSubmitted(true);
  }

  if (submitted) {
    return <div className="space-y-5" role="status"><p className="rounded-md border border-border bg-muted p-4 text-sm leading-6">If an account exists for that email address, we sent a password-reset link. Check your inbox and spam folder.</p><Button asChild className="w-full" variant="outline"><Link href="/login">Return to sign in</Link></Button></div>;
  }

  return <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate><FormField id="email" label="Email address" error={form.formState.errors.email?.message} required><Input id="email" type="email" autoComplete="email" aria-describedby={form.formState.errors.email ? "email-error" : undefined} {...form.register("email")} /></FormField><Button className="w-full" type="submit" disabled={form.formState.isSubmitting || !configured}>{form.formState.isSubmitting ? "Sending link…" : configured ? "Send reset link" : "Authentication not configured"}</Button><p className="text-center text-sm"><Link className="text-brand underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" href="/login">Return to sign in</Link></p></form>;
}

export function PasswordUpdateForm() {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const form = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema), defaultValues: { password: "", confirmPassword: "" } });

  async function onSubmit(values: PasswordValues) {
    if (!configured) { toast.error("Authentication is not configured yet."); return; }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) { toast.error("We could not update your password. Request a new link and try again."); return; }
    await supabase.auth.signOut();
    router.replace("/login?message=password_updated");
    router.refresh();
  }

  return <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate><FormField id="password" label="New password" error={form.formState.errors.password?.message} required><Input id="password" type="password" autoComplete="new-password" aria-describedby={form.formState.errors.password ? "password-error" : undefined} {...form.register("password")} /></FormField><FormField id="confirm-password" label="Confirm new password" error={form.formState.errors.confirmPassword?.message} required><Input id="confirm-password" type="password" autoComplete="new-password" aria-describedby={form.formState.errors.confirmPassword ? "confirm-password-error" : undefined} {...form.register("confirmPassword")} /></FormField><Button className="w-full" type="submit" disabled={form.formState.isSubmitting || !configured}>{form.formState.isSubmitting ? "Saving password…" : configured ? "Save new password" : "Authentication not configured"}</Button></form>;
}
