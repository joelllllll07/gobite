import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, Sparkles, Search, ArrowRight, Star, Shield, Zap } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/gobite";
import { useGeolocation } from "@/hooks/use-geolocation";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const { request, loading } = useGeolocation();

  const useLocation = () => {
    request();
    navigate({ to: "/explore" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 gradient-warm opacity-60" />
        <div className="absolute -top-32 -right-40 h-[520px] w-[520px] rounded-full bg-primary/25 blur-3xl -z-10" />
        <div className="absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full bg-primary/15 blur-3xl -z-10" />

        <div className="mx-auto max-w-7xl px-6 pt-16 pb-24 md:pt-24 md:pb-32 grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 backdrop-blur px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Powered by Google Maps Platform
            </div>
            <h1 className="mt-5 text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-balance">
              Find the best places <span className="text-primary">around you.</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-lg">
              Discover highly-rated restaurants, cafés, bakeries and hotels near you — with a smart AI assistant to help you decide.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={useLocation}
                disabled={loading}
                className="rounded-full bg-primary text-primary-foreground hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-lift)] px-6"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Use my location
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate({ to: "/explore" })}
                className="rounded-full px-6"
              >
                <Search className="h-4 w-4 mr-2" />
                Explore nearby
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-primary fill-primary" /> Only official Google data</div>
              <div className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-primary" /> Private & secure</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-lg mx-auto">
              <img
                src={heroImg}
                alt="GoBite — food discovery"
                width={1600}
                height={1200}
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Popular categories</h2>
            <p className="mt-2 text-muted-foreground">Browse by what you're craving.</p>
          </div>
          <Link to="/explore" className="text-sm font-semibold text-primary hover:underline hidden sm:inline-flex items-center gap-1">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {CATEGORIES.slice(0, 12).map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.03 }}
            >
              <Link
                to="/explore"
                search={{ category: c.type } as never}
                className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card p-5 card-hover"
              >
                <div className="text-3xl transition-transform group-hover:scale-110">{c.icon}</div>
                <div className="text-sm font-semibold">{c.label}</div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why GoBite */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="rounded-3xl bg-surface border border-border p-8 md:p-14">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Why choose GoBite</h2>
            <p className="mt-3 text-muted-foreground">
              A premium discovery experience built on trustworthy data.
            </p>
          </div>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[
              { icon: <Zap className="h-5 w-5" />, title: "Fast & fluid", desc: "Instant nearby results with smooth, responsive interactions on any device." },
              { icon: <Shield className="h-5 w-5" />, title: "Trusted data", desc: "Every rating, address and photo comes directly from Google Maps Platform." },
              { icon: <Sparkles className="h-5 w-5" />, title: "AI assistant", desc: "Ask in plain English — GoBite finds highly rated places, filtered by what you love." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl bg-card border border-border p-6 card-hover">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center">Loved by food explorers</h2>
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {[
            { name: "Ana P.", role: "Barcelona", quote: "Found a tiny bakery two blocks from my flat that I'd walked past a hundred times. GoBite is magical." },
            { name: "Kenji R.", role: "Tokyo", quote: "The AI assistant is spot-on. I just typed 'quiet café for reading' and it delivered." },
            { name: "Maya S.", role: "Nairobi", quote: "Booking a weekend trip and GoBite's hotel filters are so much cleaner than anything else." },
          ].map((t) => (
            <div key={t.name} className="rounded-2xl border border-border bg-card p-6 card-hover">
              <div className="flex text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary" />
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed">{t.quote}</p>
              <p className="mt-4 text-xs text-muted-foreground"><span className="font-semibold text-foreground">{t.name}</span> · {t.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-14">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center">Questions, answered</h2>
        <div className="mt-8 space-y-3">
          {[
            { q: "Where does the data come from?", a: "Every place, rating, photo, and phone number in GoBite comes directly from official Google Maps Platform APIs." },
            { q: "Does GoBite show reviews?", a: "No — GoBite only uses officially available data. We don't display or summarize review text." },
            { q: "Is my location shared?", a: "Your location is used only in your browser and to search for nearby places. It is not stored on our servers." },
            { q: "Do I need to sign in?", a: "You can explore as a guest. Sign in to save favorites, build a wishlist, and compare places." },
          ].map((f) => (
            <details key={f.q} className="group rounded-2xl border border-border bg-card p-5">
              <summary className="cursor-pointer list-none flex items-center justify-between font-semibold">
                {f.q}
                <span className="text-primary transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="rounded-3xl bg-primary text-primary-foreground p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,white,transparent_50%),radial-gradient(circle_at_80%_80%,white,transparent_50%)]" />
          <h2 className="relative text-3xl md:text-5xl font-bold tracking-tight">Find your next favorite bite.</h2>
          <p className="relative mt-3 text-primary-foreground/80 max-w-lg mx-auto">
            Explore highly-rated places around you in seconds.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={useLocation}
            className="relative mt-6 rounded-full bg-background text-foreground hover:bg-background/90 px-6"
          >
            <MapPin className="h-4 w-4 mr-2" /> Start exploring
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
