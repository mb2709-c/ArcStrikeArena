import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Loader2 } from "lucide-react";
import { useAccount } from "wagmi";

import { FighterToggle } from "@/components/fighter-toggle";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useArenaActions } from "@/hooks/useArenaData";
import { encryptSkill, initializeFHE, getFHEInstance } from "@/lib/fhe";
import { ARC_STRIKE_ARENA_ADDRESS } from "@/constants/contracts";
import { useFheStore } from "@/store/useFheStore";
import type { DuelDetail } from "@/types";

const betSchema = z.object({
  weight: z.number().min(1).max(100)
});

type BetSheetValues = z.infer<typeof betSchema>;

interface BetSheetProps {
  detail: DuelDetail;
  activeFighterId: string;
  onSelectFighter: (fighterId: string) => void;
}

export function BetSheet({ detail, activeFighterId, onSelectFighter }: BetSheetProps) {
  const { placeBet } = useArenaActions(detail.duelId);
  const { address } = useAccount();
  const [isEncrypting, setIsEncrypting] = useState(false);
  const { ready: fheReady, initializing: fheInitializing } = useFheStore();

  const form = useForm<BetSheetValues>({
    resolver: zodResolver(betSchema),
    defaultValues: {
      weight: 50
    }
  });

  // Initialize FHE SDK only when wallet is connected
  useEffect(() => {
    if (!address) {
      return;
    }

    if (fheReady || fheInitializing || getFHEInstance()) {
      return;
    }

    console.log("[BetSheet] Initializing FHE SDK with wallet:", address);
    initializeFHE().catch((error) => {
      console.error("[BetSheet] FHE initialization failed:", error);
    });
  }, [address, fheReady, fheInitializing]);

  const handleSubmit = async (values: BetSheetValues) => {
    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    if (!fheReady) {
      alert("FHE SDK is still initializing. Please wait a moment and try again.");
      return;
    }

    try {
      setIsEncrypting(true);

      console.log(`[BetSheet] Encrypting skill value: ${values.weight}`);

      // Auto-encrypt the skill value using FHE
      const encrypted = await encryptSkill(
        BigInt(values.weight),
        ARC_STRIKE_ARENA_ADDRESS,
        address
      );

      console.log('[BetSheet] Encryption successful, submitting bet...');

      // Submit with auto-generated handle and proof (Uint8Arrays)
      placeBet.mutate({
        fighterId: activeFighterId,
        weight: values.weight,
        handle: encrypted.handle,
        proof: encrypted.proof,
        encryptedAt: Date.now()
      });
    } catch (error) {
      console.error("[BetSheet] Encryption failed:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      alert(`Failed to encrypt skill value: ${errorMsg}`);
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <div className="space-y-4 rounded-[1.75rem] border border-[#7027E0]/35 bg-slate-950/70 p-5">
      <h3 className="font-display text-2xl text-[#d3c4ff]">Place Bet</h3>
      <p className="text-sm text-sky-200/80">
        Select your champion and set your skill value (1-100). Your value will be automatically encrypted using FHE before submission.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {detail.fighters.map((fighter) => (
          <FighterToggle
            key={fighter.id}
            fighter={fighter}
            active={fighter.id === activeFighterId}
            onSelect={() => onSelectFighter(fighter.id)}
          />
        ))}
      </div>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <div className="space-y-2">
          <Label>Skill Value (1-100)</Label>
          <input
            type="range"
            min={1}
            max={100}
            step={1}
            value={form.watch("weight")}
            onChange={(event) => form.setValue("weight", Number(event.target.value))}
            className="w-full accent-[#7027E0]"
          />
          <div className="flex items-center justify-between text-xs">
            <span className="text-sky-200/70">This value will be encrypted on-chain</span>
            <span className="font-mono text-[#2BF4FF]">{form.watch("weight")}</span>
          </div>
          {form.formState.errors.weight && (
            <p className="text-xs text-rose-400">{form.formState.errors.weight.message}</p>
          )}
        </div>
        <div className="rounded-lg border border-[#7027E0]/20 bg-slate-950/50 p-3 text-xs text-sky-200/70">
          <p className="mb-1 font-semibold text-[#2BF4FF]">🔒 Privacy Protection</p>
          <p>Your skill value will be encrypted using Zama FHE before being sent to the blockchain. Only the encrypted value is stored on-chain.</p>
        </div>
        <Button
          type="submit"
          className="w-full gap-2"
          disabled={placeBet.isPending || isEncrypting || !fheReady}
        >
          {!fheReady ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {fheInitializing ? "Initializing FHE..." : "Ready check..."}
            </>
          ) : isEncrypting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Encrypting...
            </>
          ) : placeBet.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting Bet...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              Place Encrypted Bet ({detail.stake} ETH)
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

