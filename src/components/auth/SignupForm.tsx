"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { APP_NAME } from "@/lib/brand";
import { getAuthCallbackUrl } from "@/lib/siteUrl";

export function SignupForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: username.trim() },
        emailRedirectTo: getAuthCallbackUrl(),
      },
    });
    setLoading(false);

    if (error) {
      toast.error("Signup failed", { description: error.message });
      return;
    }

    toast.success(`Welcome to ${APP_NAME}!`, {
      description:
        "Check your email to confirm — the link goes to this app, not localhost (if SITE_URL is set in production).",
    });
    router.push("/login");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Climber name</Label>
        <Input
          id="username"
          required
          minLength={2}
          maxLength={32}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="CrimpKing42"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full font-bold" disabled={loading}>
        {loading ? "Creating forearms..." : "Sign up & flex"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already on CC?{" "}
        <Link href="/login" className="font-semibold text-orange-400 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
