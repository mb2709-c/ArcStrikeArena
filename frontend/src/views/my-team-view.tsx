import { Trophy } from "lucide-react";

import { MyCipherDialog } from "@/components/my-cipher-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useArenaActions, useBetPositions } from "@/hooks/useArenaData";

export function MyTeamView() {
  const positionsQuery = useBetPositions();
  const positions = positionsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Squad Bets</CardTitle>
          <CardDescription>Track encrypted wagers, claim winnings, or request refunds if duels cancel.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[360px] pr-3">
            <ul className="space-y-3 text-sm text-sky-100/90">
              {positions.map((position) => (
                <PositionRow key={position.duelId} position={position} />
              ))}
              {!positions.length ? <p className="text-xs text-sky-200/70">No wagers found.</p> : null}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function PositionRow({ position }: { position: NonNullable<ReturnType<typeof useBetPositions>["data"]>[number] }) {
  const { claimPrize, claimRefund } = useArenaActions(position.duelId);

  return (
    <li className="rounded-[1.5rem] border border-[#7027E0]/35 bg-slate-950/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-sky-200/70">{position.duelId}</p>
          <p className="text-xs text-sky-200/70">Supported fighter: {position.supportedFighter}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <MyCipherDialog position={position} />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-xs uppercase tracking-[0.28em] text-sky-200/70">
        <span>
          Weight <strong className="text-[#2BF4FF]">{position.weight}</strong>
        </span>
        <span>
          Claimed <strong className="text-[#2BF4FF]">{position.claimed ? "Yes" : "No"}</strong>
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="default"
          size="sm"
          className="gap-2"
          disabled={position.claimed}
          onClick={() => claimPrize.mutate()}
        >
          <Trophy className="h-4 w-4" />
          Claim Prize
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!position.refundable}
          onClick={() => claimRefund.mutate()}
        >
          Request Refund
        </Button>
      </div>
    </li>
  );
}



