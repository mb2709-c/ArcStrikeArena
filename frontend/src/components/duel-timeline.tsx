import { friendlyTime } from "@/hooks/useArenaData";
import type { DuelDetail } from "@/types";

interface DuelTimelineProps {
  timeline: DuelDetail["timeline"];
}

export function DuelTimeline({ timeline }: DuelTimelineProps) {
  if (!timeline?.length) return null;

  return (
    <ol className="relative space-y-4 border-l border-[#7027E0]/25 pl-5">
      {timeline.map((item) => (
        <li key={item.label} className="relative">
          <span className="absolute -left-[10px] top-1 h-2.5 w-2.5 rounded-full border border-[#2BF4FF]/50 bg-[#2BF4FF]/20 shadow shadow-[#2BF4FF]/20" />
          <p className="text-xs uppercase tracking-[0.32em] text-sky-200/70">{item.label}</p>
          <p className="text-[11px] text-sky-200/60">{friendlyTime(item.timestamp)}</p>
        </li>
      ))}
    </ol>
  );
}



