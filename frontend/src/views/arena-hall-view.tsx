import { useMemo } from "react";
import { Filter, Flame, Loader2, Sword } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { fighterGradient, formatCountdown, useArenaHall, useArenaRole } from "@/hooks/useArenaData";
import type { DuelSummary } from "@/types";

interface ArenaHallViewProps {
  activeDuelId?: string;
  onSelectDuel: (duelId: string) => void;
}

export function ArenaHallView({ activeDuelId, onSelectDuel }: ArenaHallViewProps) {
  const hallQuery = useArenaHall();
  const { filters, setFilters, role } = useArenaRole();
  const duels = hallQuery.data ?? [];

  const statusOptions = useMemo<DuelSummary["status"][]>(() => ["Open", "RevealPending", "Revealed", "Cancelled"], []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>Arc Strike Duels</CardTitle>
            <CardDescription>Support your champion with encrypted wagers and monitor reveal flows.</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="muted" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Badge>
            <Select value={filters.status} onValueChange={(value) => setFilters({ status: value as typeof filters.status })}>
              <SelectTrigger className="w-36 border-[#7027E0]/30 bg-slate-950/60 text-xs uppercase tracking-[0.28em] text-sky-100">
                {filters.status}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.minStake} onValueChange={(value) => setFilters({ minStake: value as typeof filters.minStake })}>
              <SelectTrigger className="w-32 border-[#7027E0]/30 bg-slate-950/60 text-xs uppercase tracking-[0.28em] text-sky-100">
                {filters.minStake}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stakes</SelectItem>
                <SelectItem value="low">≤ 0.02</SelectItem>
                <SelectItem value="mid">0.02 - 0.05</SelectItem>
                <SelectItem value="high">{'>'} 0.05</SelectItem>
              </SelectContent>
            </Select>
            {role === "organizer" ? (
              <Button className="gap-2" variant="accent">
                <Sword className="h-4 w-4" />
                Launch Duel
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          {hallQuery.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-sky-200/70">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading duels...
            </div>
          ) : null}
          <ScrollArea className="mt-4 h-[420px] pr-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {duels.map((duel) => (
                <DuelCard
                  key={duel.duelId}
                  duel={duel}
                  active={duel.duelId === activeDuelId}
                  onSelect={() => onSelectDuel(duel.duelId)}
                />
              ))}
              {!duels.length ? <p className="text-sm text-sky-200/70">No duels found.</p> : null}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function DuelCard({ duel, active, onSelect }: { duel: DuelSummary; active: boolean; onSelect: () => void }) {
  return (
    <div
      className={`rounded-[1.5rem] border px-5 py-4 transition ${
        active
          ? "border-[#2BF4FF]/60 bg-[#2BF4FF]/10"
          : "border-[#7027E0]/35 bg-slate-950/70 hover:border-[#2BF4FF]/35 hover:bg-slate-950/75"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-xl text-[#d3c4ff]">{duel.duelId}</h3>
        <Badge variant="cyan">{duel.status}</Badge>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-xs uppercase tracking-[0.28em] text-sky-200/70">
        <span>
          Stake <strong className="text-[#2BF4FF]">{duel.stake} ETH</strong>
        </span>
        <span>
          Prize Pool <strong className="text-[#2BF4FF]">{duel.prizePool.toFixed(1)} ETH</strong>
        </span>
        <span>
          Supporters <strong className="text-[#2BF4FF]">{duel.supporters}</strong>
        </span>
        <span>
          Time Left <strong className="text-[#2BF4FF]">{formatCountdown(duel.timeLeft)}</strong>
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {duel.fighters.map((fighter) => (
          <div
            key={fighter.id}
            className="flex items-center gap-3 rounded-[1.25rem] border border-[#7027E0]/25 bg-slate-950/70 p-3"
            style={{ borderColor: `${fighter.avatarColor}40` }}
            aria-label={`Fighter ${fighter.name} with handle ${fighter.handle}`}
          >
            <div
              className="h-12 w-12 rounded-full border border-transparent shadow-lg"
              style={{ backgroundImage: fighterGradient(fighter.avatarColor) }}
            />
            <div className="text-xs text-sky-200/80">
              <p className="font-semibold text-[#d3c4ff]">{fighter.name}</p>
              <p>{fighter.handle}</p>
            </div>
          </div>
        ))}
      </div>
      <Button className="mt-4 w-full gap-2" variant={active ? "secondary" : "default"} onClick={onSelect}>
        <Flame className="h-4 w-4" />
        {active ? "Viewing Duel" : "View Duel"}
      </Button>
    </div>
  );
}



