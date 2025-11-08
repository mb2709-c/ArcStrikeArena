import { cn } from "@/lib/utils";
import type { FighterProfile } from "@/types";

interface FighterToggleProps {
  fighter: FighterProfile;
  active: boolean;
  onSelect: () => void;
}

export function FighterToggle({ fighter, active, onSelect }: FighterToggleProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex items-center gap-3 rounded-[1.5rem] border border-[#7027E0]/25 bg-slate-950/70 p-3 text-left transition hover:border-[#2BF4FF]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2BF4FF]",
        active ? "border-[#2BF4FF]/50 shadow-[0_12px_24px_-15px_rgba(43,244,255,0.6)]" : ""
      )}
      onClick={onSelect}
      aria-label={`Select fighter ${fighter.name} with handle ${fighter.handle}`}
    >
      <div
        className="h-12 w-12 rounded-full border border-transparent shadow-lg"
        style={{ backgroundImage: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), transparent 40%), ${fighter.avatarColor ? `linear-gradient(135deg, ${fighter.avatarColor} 0%, #2BF4FF 100%)` : "linear-gradient(135deg, #7027E0 0%, #2BF4FF 100%)"}` }}
      />
      <div className="text-xs text-sky-200/80">
        <p className="font-semibold text-[#d3c4ff]">{fighter.name}</p>
        <p>{fighter.handle}</p>
        <p className="text-[10px] uppercase tracking-[0.32em]">Win Rate {(fighter.winRate * 100).toFixed(1)}%</p>
      </div>
    </button>
  );
}



