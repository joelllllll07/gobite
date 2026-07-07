import { createFileRoute, Link } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2, MapPin, Star } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useGeolocation } from "@/hooks/use-geolocation";
import type { PlaceSummary } from "@/lib/google-maps.server";
import { photoUrl, priceLevelLabel } from "@/lib/gobite";

export const Route = createFileRoute("/assistant")({
  component: AssistantPage,
  head: () => ({ meta: [{ title: "AI Assistant · GoBite" }] }),
});

const EXAMPLES = [
  "Show highly rated cafés within 3 km",
  "Find affordable restaurants open now",
  "Suggest quiet places for reading",
  "Hotels with excellent ratings nearby",
];

function AssistantPage() {
  const { coords, request } = useGeolocation();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: () => ({ location: coords }),
    }),
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  };

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="mx-auto max-w-3xl w-full px-4 sm:px-6 py-6 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-lift)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">GoBite AI</h1>
            <p className="text-xs text-muted-foreground">Discovery assistant powered by Google Maps data.</p>
          </div>
          {!coords && (
            <Button size="sm" variant="outline" onClick={request} className="ml-auto rounded-full">
              <MapPin className="h-3.5 w-3.5 mr-1.5" /> Share location
            </Button>
          )}
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto rounded-3xl border border-border bg-card p-4 sm:p-6 min-h-[420px] max-h-[calc(100vh-320px)]"
        >
          {messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-lg font-semibold">Ask about places near you</p>
              <p className="mt-1 text-sm text-muted-foreground">Try one of these to get started:</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => sendMessage({ text: ex })}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:border-primary hover:text-primary transition"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted rounded-bl-md"
                  }`}>
                    {m.parts.map((part, i) => {
                      if (part.type === "text") {
                        return (
                          <div key={i} className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-2">
                            <ReactMarkdown>{part.text}</ReactMarkdown>
                          </div>
                        );
                      }
                      if (part.type === "tool-invocation" && part.toolInvocation.state === "result") {
                        const result = part.toolInvocation.result as { places?: PlaceSummary[] };
                        if (result?.places?.length) {
                          return <PlaceList key={i} places={result.places.slice(0, 5)} />;
                        }
                      }
                      return null;
                    })}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
                </div>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={submit} className="mt-4">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card p-1.5 pl-4 shadow-[var(--shadow-soft)]">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about nearby places…"
              className="flex-1 bg-transparent text-sm outline-none py-2"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              size="icon"
              className="rounded-full bg-primary text-primary-foreground hover:bg-[var(--color-primary-hover)] h-9 w-9"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-[11px] text-center text-muted-foreground">
            AI answers use only officially available Google Maps data.
          </p>
        </form>
      </main>

      <Footer />
    </div>
  );
}

function PlaceList({ places }: { places: PlaceSummary[] }) {
  return (
    <div className="mt-3 grid gap-2">
      {places.map((p) => {
        const img = photoUrl(p.photo, 200);
        return (
          <Link
            key={p.id}
            to="/place/$placeId"
            params={{ placeId: p.id }}
            className="flex gap-3 rounded-xl border border-border bg-background p-2 hover:border-primary transition"
          >
            <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-muted">
              {img ? (
                <img src={img} alt={p.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full gradient-warm grid place-items-center">🍽️</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-foreground line-clamp-1">{p.name}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                {p.rating != null && (
                  <span className="inline-flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-primary text-primary" /> {p.rating.toFixed(1)}
                  </span>
                )}
                {p.userRatingCount != null && <span>({p.userRatingCount})</span>}
                {p.priceLevel != null && <span>· {priceLevelLabel(p.priceLevel)}</span>}
              </div>
              {p.address && <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{p.address}</div>}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
