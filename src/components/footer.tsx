import { Link } from "@tanstack/react-router";
import { Github, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-24">
      <div className="mx-auto max-w-7xl px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              🍴
            </div>
            <span className="text-lg font-bold">GoBite</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-sm">
            Find your next favorite bite. Discover highly-rated restaurants, cafés, bakeries and hotels near you — powered by Google Maps Platform.
          </p>
          <div className="mt-4 flex gap-3">
            <a className="p-2 rounded-full border border-border hover:border-primary hover:text-primary transition" href="#" aria-label="GitHub"><Github className="h-4 w-4" /></a>
            <a className="p-2 rounded-full border border-border hover:border-primary hover:text-primary transition" href="#" aria-label="LinkedIn"><Linkedin className="h-4 w-4" /></a>
            <a className="p-2 rounded-full border border-border hover:border-primary hover:text-primary transition" href="#" aria-label="Twitter"><Twitter className="h-4 w-4" /></a>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-3">Product</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/explore" className="hover:text-primary">Explore</Link></li>
            <li><Link to="/assistant" className="hover:text-primary">AI Assistant</Link></li>
            <li><Link to="/saved" className="hover:text-primary">Saved places</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-primary">About</a></li>
            <li><a href="#" className="hover:text-primary">Privacy</a></li>
            <li><a href="#" className="hover:text-primary">Terms</a></li>
            <li><a href="#" className="hover:text-primary">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} GoBite. Data from Google Maps Platform.
      </div>
    </footer>
  );
}
