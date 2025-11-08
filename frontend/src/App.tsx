import { useEffect, useMemo, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Axe, Flame, ShieldCheck, Users } from "lucide-react";
import { Toaster } from "sonner";

import { TransactionBanner } from "@/components/transaction-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useArenaRole } from "@/hooks/useArenaData";
import { ArenaHallView } from "@/views/arena-hall-view";
import { DuelDetailView } from "@/views/duel-detail-view";
import { MyTeamView } from "@/views/my-team-view";

type NavId = "hall" | "duel" | "team";

const NAV_ITEMS: Array<{ id: NavId; label: string; icon: typeof Flame; roles: Array<"organizer" | "supporter" | "spectator"> }> = [
  { id: "hall", label: "Arena Hall", icon: Flame, roles: ["organizer", "supporter", "spectator"] },
  { id: "duel", label: "Duel Detail", icon: Axe, roles: ["organizer", "supporter", "spectator"] },
  { id: "team", label: "My Team", icon: Users, roles: ["organizer", "supporter"] }
];

export default function App() {
  const { role, setRole, selectedDuelId, setSelectedDuelId } = useArenaRole();
  const [nav, setNav] = useState<NavId>("hall");

  useEffect(() => {
    if (!selectedDuelId) {
      setSelectedDuelId("ARC-511");
    }
  }, [selectedDuelId, setSelectedDuelId]);

  useEffect(() => {
    const navMeta = NAV_ITEMS.find((item) => item.id === nav);
    if (navMeta && !navMeta.roles.includes(role)) {
      const fallback = NAV_ITEMS.find((item) => item.roles.includes(role));
      if (fallback) setNav(fallback.id);
    }
  }, [role, nav]);

  const pageTitle = useMemo(() => NAV_ITEMS.find((item) => item.id === nav)?.label ?? "Arc Strike Arena Console", [nav]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="bottom-right" richColors />
      <div className="grid min-h-screen lg:grid-cols-[260px,1fr]">
        <aside className="hidden border-r border-[#7027E0]/35 bg-slate-950/85 pb-12 pt-12 lg:flex lg:flex-col">
          <div className="space-y-3 px-8">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gradient-to-r from-[#7027E0] to-[#2BF4FF] p-2 text-slate-950 shadow-lg shadow-[#7027E0]/40">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-xl text-[#d3c4ff]">Arc Strike Arena</p>
                <p className="text-xs uppercase tracking-[0.32em] text-sky-200/70">Encrypted Duel Console</p>
              </div>
            </div>
            <Separator />
          </div>
          <nav className="mt-6 flex-1 space-y-1 px-4">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const enabled = item.roles.includes(role);
              const isActive = nav === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start gap-3"
                  disabled={!enabled}
                  onClick={() => setNav(item.id)}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {!enabled ? <Badge variant="muted">Locked</Badge> : null}
                </Button>
              );
            })}
          </nav>
          <div className="mt-auto space-y-3 px-6 text-xs text-sky-200/70">
            <div className="flex items-center justify-between gap-2">
              <span>Role</span>
              <select
                className="rounded-full border border-[#7027E0]/30 bg-slate-950/70 px-3 py-1 text-xs text-sky-100 focus:outline-none"
                value={role}
                onChange={(event) => setRole(event.target.value as typeof role)}
              >
                <option value="supporter">Supporter</option>
                <option value="spectator">Spectator</option>
                <option value="organizer">Organizer</option>
              </select>
            </div>
            <p className="text-[11px] uppercase tracking-[0.34em] text-sky-200/60">
              Use fhEVM CLI to create encrypted wagers. Keep cipher handles secure until reveal completes.
            </p>
          </div>
        </aside>

        <div className="flex flex-col">
          <header className="border-b border-[#7027E0]/35 bg-slate-950/60 backdrop-blur-md">
            <div className="flex flex-col gap-6 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-sky-200/70">{pageTitle}</p>
                <h1 className="font-display text-4xl text-[#d3c4ff]">Support Champions with Encrypted Bets</h1>
                <p className="mt-1 text-sm text-sky-200/80">
                  Private weighting keeps strategy hidden until reveal. Watch aggregated totals unlock fair competition.
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 sm:items-end">
                <ConnectButton chainStatus="icon" showBalance={false} />
                <div className="flex flex-wrap gap-2">
                  <Badge variant="cyan">{role.toUpperCase()}</Badge>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 space-y-8 overflow-y-auto px-6 py-8">
            <TransactionBanner />
            {nav === "hall" ? (
              <ArenaHallView
                activeDuelId={selectedDuelId}
                onSelectDuel={(id) => {
                  setSelectedDuelId(id);
                  setNav("duel");
                }}
              />
            ) : null}
            {nav === "duel" && selectedDuelId ? <DuelDetailView duelId={selectedDuelId} /> : null}
            {nav === "team" ? <MyTeamView /> : null}
          </main>
        </div>
      </div>
    </div>
  );
}



