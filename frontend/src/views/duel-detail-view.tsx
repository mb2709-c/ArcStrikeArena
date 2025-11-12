import { useState } from "react";
import { AlertTriangle, Loader2, ShieldCheck, Trophy, Undo2 } from "lucide-react";

import { BetSheet } from "@/components/bet-sheet";
import { DuelTimeline } from "@/components/duel-timeline";
import { StatusBanner } from "@/components/status-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  useArenaActions,
  useArenaRole,
  useDuelDetail
} from "@/hooks/useArenaData";

export function DuelDetailView({ duelId }: { duelId: string }) {
  const detailQuery = useDuelDetail(duelId);
  const detail = detailQuery.data;
  const userBet = detailQuery.userBet;
  const { role } = useArenaRole();
  const [activeFighterId, setActiveFighterId] = useState<string>(detail?.fighters[0].id ?? "");

  const { settleDuel, cancelDuel, claimPrize, claimRefund } = useArenaActions(duelId);

  if (detailQuery.isLoading || !detail) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-sky-200/70">
          <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-[#2BF4FF]" />
          Loading duel...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <StatusBanner detail={detail} />

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>{detail.duelId}</CardTitle>
            <CardDescription>{detail.description}</CardDescription>
          </div>
          <Badge variant="cyan">{detail.status}</Badge>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-6">
            <BetSheet detail={detail} activeFighterId={activeFighterId} onSelectFighter={setActiveFighterId} />

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Match Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <DuelTimeline timeline={detail.timeline} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Duel Result</CardTitle>
                <CardDescription>
                  {detail.settled
                    ? `Winner: ${detail.winningSide === 1 ? detail.fighters[0].name : detail.winningSide === 2 ? detail.fighters[1].name : 'Draw'}`
                    : 'Duel not yet settled'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {detail.settled ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>{detail.fighters[0].name} Supporters:</span>
                      <span className="text-[#7027E0]">{detail.supporters}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{detail.fighters[1].name} Supporters:</span>
                      <span className="text-[#2BF4FF]">{detail.supporters}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-sky-200/70">Results will be available after settlement</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Supporter Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-sky-100/90">
                <p className="text-xs uppercase tracking-[0.32em] text-sky-200/70">Your position</p>
                {userBet ? (
                  <div className="flex flex-col gap-2 rounded-[1.5rem] border border-[#7027E0]/30 bg-slate-950/70 p-4">
                    <p className="text-xs uppercase tracking-[0.32em]">
                      Fighter <span className="text-[#2BF4FF]">{userBet.fighterName}</span>
                    </p>
                    <p className="text-xs uppercase tracking-[0.32em]">
                      Side <span className="text-[#2BF4FF]">{userBet.side === 1 ? 'A' : 'B'}</span>
                    </p>
                    {detail.settled && (
                      <p className="text-xs uppercase tracking-[0.32em]">
                        Status <span className={userBet.isWinner ? "text-green-400" : "text-red-400"}>
                          {userBet.isWinner ? 'WON' : 'LOST'}
                        </span>
                      </p>
                    )}
                    {userBet.claimed && (
                      <p className="text-xs uppercase tracking-[0.32em]">
                        <span className="text-yellow-400">CLAIMED</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-sky-200/70">No wager recorded for this duel.</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-2"
                    disabled={!userBet || !userBet.canClaim || userBet.claimed || !userBet.isWinner}
                    onClick={() => claimPrize.mutate()}
                  >
                    <Trophy className="h-4 w-4" />
                    Claim Prize
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled={!userBet || !userBet.canClaim || userBet.claimed || userBet.isWinner}
                    onClick={() => claimRefund.mutate()}
                  >
                    <Undo2 className="h-4 w-4" />
                    Claim Refund
                  </Button>
                </div>
              </CardContent>
            </Card>

            {detail.status === "Locked" && !detail.settled ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Duel Actions</CardTitle>
                  <CardDescription>Settle the duel or cancel it if needed.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <ActionConfirm
                      label="Settle Duel"
                      description="Settle this duel to determine the winner. Anyone can call this after the deadline."
                      onConfirm={() => settleDuel.mutate()}
                      pending={settleDuel.isPending}
                    />
                    <ActionConfirm
                      label="Cancel Duel"
                      description="Cancel duel to unlock refunds for all supporters. Anyone can call this after the deadline."
                      onConfirm={() => cancelDuel.mutate()}
                      pending={cancelDuel.isPending}
                      variant="outline"
                    />
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ActionConfirm({
  label,
  description,
  onConfirm,
  pending,
  variant = "default"
}: {
  label: string;
  description: string;
  onConfirm: () => void;
  pending: boolean;
  variant?: "default" | "outline";
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={variant} className="gap-2" disabled={pending}>
          {label === "Settle Duel" ? <ShieldCheck className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost">Close</Button>
          <Button onClick={onConfirm} disabled={pending}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



