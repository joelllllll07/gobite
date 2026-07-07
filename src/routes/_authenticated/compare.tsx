import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Star, Check, X } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { listSaved } from "@/lib/saved.functions";
import { priceLevelLabel } from "@/lib/gobite";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/compare")({
  component: ComparePage,
  head: () => ({ meta: [{ title: "Compare places · GoBite" }] }),
});

function ComparePage() {
  const list = useServerFn(listSaved);
  const { data } = useQuery({ queryKey: ["saved-places"], queryFn: () => list() });
  const [selected, setSelected] = useState<string[]>([]);

  const rows = data ?? [];
  const picked = rows.filter((r) => selected.includes(r.id));

  const toggle = (id: string) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < 3 ? [...s, id] : s));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Compare places</h1>
        <p className="mt-1 text-muted-foreground text-sm">Pick up to 3 saved places to compare side by side.</p>

        {rows.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Save a few places first.</p>
            <Button asChild className="mt-4 rounded-full bg-primary text-primary-foreground">
              <Link to="/explore">Discover places</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap gap-2">
              {rows.map((r) => (
                <button
                  key={r.id}
                  onClick={() => toggle(r.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    selected.includes(r.id)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:border-primary"
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>

            {picked.length > 0 && (
              <div className="mt-8 overflow-x-auto rounded-3xl border border-border bg-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-muted-foreground">Property</th>
                      {picked.map((p) => (
                        <th key={p.id} className="text-left p-4 font-semibold">{p.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <Row label="Rating" values={picked.map((p) => p.rating != null ? (
                      <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-primary text-primary" />{Number(p.rating).toFixed(1)}</span>
                    ) : "—")} />
                    <Row label="Total ratings" values={picked.map((p) => p.user_ratings_total?.toLocaleString() ?? "—")} />
                    <Row label="Price" values={picked.map((p) => priceLevelLabel(p.price_level ?? undefined) || "—")} />
                    <Row label="Address" values={picked.map((p) => p.address ?? "—")} />
                    <Row label="Types" values={picked.map((p) => (p.types ?? []).slice(0, 3).join(", ") || "—")} />
                    <Row label="Coordinates" values={picked.map((p) => p.lat && p.lng ? `${Number(p.lat).toFixed(4)}, ${Number(p.lng).toFixed(4)}` : "—")} />
                    <tr className="border-t border-border">
                      <td className="p-4 text-muted-foreground">Details</td>
                      {picked.map((p) => (
                        <td key={p.id} className="p-4">
                          <Button asChild variant="outline" size="sm" className="rounded-full">
                            <Link to="/place/$placeId" params={{ placeId: p.place_id }}>View</Link>
                          </Button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

function Row({ label, values }: { label: string; values: React.ReactNode[] }) {
  return (
    <tr className="border-t border-border">
      <td className="p-4 text-muted-foreground">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="p-4">{v}</td>
      ))}
    </tr>
  );
}
