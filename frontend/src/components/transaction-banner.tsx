import { AlertCircle, CheckCircle2, Clock, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useBanner } from "@/hooks/useArenaData";
import { cn } from "@/lib/utils";

export function TransactionBanner() {
  const { banner, setBanner } = useBanner();

  if (!banner) return null;

  const Icon =
    banner.type === "success"
      ? CheckCircle2
      : banner.type === "error"
        ? AlertCircle
        : banner.type === "pending"
          ? Clock
          : Info;

  const tint =
    banner.type === "success"
      ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-100"
      : banner.type === "error"
        ? "bg-rose-500/15 border-rose-400/40 text-rose-100"
        : banner.type === "pending"
          ? "bg-amber-500/15 border-amber-400/40 text-amber-100"
          : "bg-[#7027E0]/20 border-[#7027E0]/45 text-[#d3c4ff]";

  return (
    <div className={cn("flex items-center justify-between gap-4 rounded-[1.5rem] border px-5 py-3 text-sm shadow-inner", tint)}>
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-slate-950/60 p-2">
          <Icon className="h-4 w-4" />
        </span>
        <div className="space-y-1">
          <p className="font-semibold tracking-wide">{banner.message}</p>
          {banner.txHash ? (
            <p className="text-xs opacity-70">
              Tx Hash: <span className="font-mono">{banner.txHash}</span>
            </p>
          ) : null}
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={() => setBanner(undefined)} className="text-current hover:bg-slate-950/50">
        Dismiss
      </Button>
    </div>
  );
}



