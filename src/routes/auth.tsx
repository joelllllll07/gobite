import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({ meta: [{ title: "Sign in · GoBite" }] }),
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  const onGoogle = async () => {
    setLoading(true);
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (res.error) {
      toast.error("Google sign-in failed");
      setLoading(false);
      return;
    }
    if (res.redirected) return;
    navigate({ to: "/" });
  };

  const onEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Account created — check your email to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: "/" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setLoading(false);
    }
  };

  const onGuest = () => navigate({ to: "/explore" });

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      <div className="hidden md:flex relative overflow-hidden gradient-warm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,var(--color-primary)_0%,transparent_50%)] opacity-40" />
        <div className="relative m-auto p-12 max-w-md text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground text-2xl shadow-[var(--shadow-lift)]">
            🍴
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight">Find your next favorite bite.</h2>
          <p className="mt-3 text-muted-foreground">
            Save favorites, build a wishlist, and let our AI assistant help you discover better places.
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm mx-auto"
        >
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back</Link>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to save and compare places." : "Save places, wishlists, and more."}
          </p>

          <Button
            variant="outline"
            className="mt-6 w-full rounded-full"
            onClick={onGoogle}
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 mr-2" aria-hidden="true">
              <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.5-1.7 4.3-5.4 4.3-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.6 3.9 14.5 3 12 3 6.9 3 2.8 7.1 2.8 12.1S6.9 21.2 12 21.2c7 0 9.3-4.9 9.3-8.9 0-.6-.1-1.1-.1-1.5H12z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex-1 h-px bg-border" /> or <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={onEmail} className="space-y-3">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="mt-1 rounded-xl" />
            </div>
            <Button type="submit" disabled={loading} className="w-full rounded-full bg-primary text-primary-foreground hover:bg-[var(--color-primary-hover)]">
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-4 text-sm text-center text-muted-foreground">
            {mode === "signin" ? "New to GoBite?" : "Have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-primary hover:underline font-medium"
            >
              {mode === "signin" ? "Create one" : "Sign in"}
            </button>
          </p>

          <button
            onClick={onGuest}
            className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground"
          >
            Continue as guest →
          </button>
        </motion.div>
      </div>
    </div>
  );
}
