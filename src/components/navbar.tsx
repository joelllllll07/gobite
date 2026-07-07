import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Moon, Search, Sun, User as UserIcon, LogOut, Sparkles } from "lucide-react";
import { useState } from "react";
import { useSession } from "@/hooks/use-session";
import { useTheme } from "@/hooks/use-theme";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const { user } = useSession();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate({ to: "/explore", search: { q: q.trim() } as never });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 w-full glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-lift)]">
            <span className="text-lg">🍴</span>
          </div>
          <span className="text-lg font-bold tracking-tight">GoBite</span>
        </Link>

        <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-xl mx-auto">
          <label className="flex w-full items-center gap-2 rounded-full border border-border bg-background px-4 py-2 shadow-[var(--shadow-soft)] focus-within:border-primary transition">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search restaurants, cafés, hotels…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>
        </form>

        <nav className="hidden md:flex items-center gap-1">
          <Link to="/explore" className="px-3 py-2 text-sm font-medium hover:text-primary transition">
            Explore
          </Link>
          <Link to="/assistant" className="px-3 py-2 text-sm font-medium hover:text-primary transition inline-flex items-center gap-1">
            <Sparkles className="h-4 w-4" /> AI
          </Link>
          {user && (
            <Link to="/saved" className="px-3 py-2 text-sm font-medium hover:text-primary transition">
              Saved
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Account">
                  <UserIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/saved" })}>
                  My saved places
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/compare" })}>
                  Compare
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="default"
              size="sm"
              className="rounded-full px-4 hidden sm:inline-flex"
              onClick={() => navigate({ to: "/auth" })}
            >
              Sign in
            </Button>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col gap-2 mt-8">
                <form onSubmit={onSearch}>
                  <label className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search…"
                      className="w-full bg-transparent text-sm outline-none"
                    />
                  </label>
                </form>
                <Link to="/explore" className="px-3 py-3 rounded-lg hover:bg-muted">Explore</Link>
                <Link to="/assistant" className="px-3 py-3 rounded-lg hover:bg-muted">AI Assistant</Link>
                {user ? (
                  <>
                    <Link to="/saved" className="px-3 py-3 rounded-lg hover:bg-muted">Saved</Link>
                    <Link to="/compare" className="px-3 py-3 rounded-lg hover:bg-muted">Compare</Link>
                    <button onClick={signOut} className="text-left px-3 py-3 rounded-lg hover:bg-muted">
                      Sign out
                    </button>
                  </>
                ) : (
                  <Link to="/auth" className="px-3 py-3 rounded-lg bg-primary text-primary-foreground text-center font-medium">
                    Sign in
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
