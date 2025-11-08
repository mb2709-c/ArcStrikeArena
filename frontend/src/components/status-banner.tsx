import { AlertCircle, CheckCircle2, Lock, RefreshCcw } from "lucide-react";

import { cn } from "@/lib/utils";
import type { DuelDetail } from "@/types";

interface StatusBannerProps {
  detail: DuelDetail;
}

export function StatusBanner({ detail }: StatusBannerProps) {
  const Icon = detail.status === "Open" ? Lock : detail.status === "RevealPending" ? RefreshCcw : detail.status === "Revealed" ? CheckCircle2 : AlertCircle;
  const tint =
    detail.status === "Open"
      ? "border-[#7027E0]/40 bg-[#7027E0]/10 text-[#d3c4ff]"
      : detail.status === "RevealPending"
        ? "border-amber-400/40 bg-amber-500/10 text-amber-100"
        : detail.status === "Revealed"
          ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
          : "border-rose-400/40 bg-rose-500/10 text-rose-100";

  const message =
    detail.status === "Open"
      ? "Encrypted weights aggregating. Reveal unlocks after betting closes."
      : detail.status === "RevealPending"
        ? "Reveal requested. Awaiting aggregator response."
        : detail.status === "Revealed"
          ? "Reveal complete. Supporters on the winning side can claim encrypted prizes."
          : "Duel cancelled. Supporters may request refunds.";

  return (
    <div className={cn("flex items-center gap-3 rounded-[1.5rem] border px-4 py-3 text-sm", tint)}>
      <span className="rounded-full bg-slate-950/50 p-2">
        <Icon className="h-4 w-4" />
      </span>
      <p>{message}</p>
    </div>
  );
}



