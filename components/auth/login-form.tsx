"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isSupabaseConfigured } from "@/lib/env/client";
import { createClient } from "@/lib/supabase/browser";

const signInSchema = z.object({ email: z.email("Enter a valid email address."), password: z.string().min(1, "Enter your password.") });
type SignInValues = z.infer<typeof signInSchema>;

export function LoginForm() {
  const router = useRouter();
  const form = useForm<SignInValues>({ resolver: zodResolver(signInSchema), defaultValues: { email: "", password: "" } });
  const configured = isSupabaseConfigured();

  async function onSubmit(values: SignInValues) {
    if (!configured) { toast.error("Authentication is not configured yet."); return; }
    const { error } = await createClient().auth.signInWithPassword(values);
    if (error) { toast.error("We could not sign you in. Check your email and password."); return; }
    router.replace("/dashboard");
    router.refresh();
  }

  return <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate><FormField id="email" label="Email address" error={form.formState.errors.email?.message} required><Input id="email" type="email" autoComplete="email" aria-describedby={form.formState.errors.email ? "email-error" : undefined} {...form.register("email")} /></FormField><div className="space-y-2"><FormField id="password" label="Password" error={form.formState.errors.password?.message} required><Input id="password" type="password" autoComplete="current-password" aria-describedby={form.formState.errors.password ? "password-error" : undefined} {...form.register("password")} /></FormField><p className="text-right text-sm"><Link className="text-brand underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" href="/forgot-password">Forgot password?</Link></p></div><Button className="w-full" type="submit" disabled={form.formState.isSubmitting || !configured}>{form.formState.isSubmitting ? "Signing in…" : configured ? "Sign in" : "Authentication not configured"}</Button><p className="text-center text-xs leading-5 text-muted-foreground">Accounts are created by school administrators. Public registration is not available.</p></form>;
}
