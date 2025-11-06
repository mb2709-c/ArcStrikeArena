/**
 * Real FHE encryption hook for Arc Strike Arena
 * Encrypts skill values using Zama FHE SDK
 */

import { useState } from "react";
import { useAccount } from "wagmi";
import { encryptSkill } from "../lib/fhe";
import { ARC_STRIKE_ARENA_ADDRESS } from "../constants/contracts";

interface EncryptParams {
  duelId: string;
  fighterId: string;
  weight: number;
}

interface EncryptResult {
  weight: number;
  ciphertext: string;
  proof: string;
}

export function useEncryptedSkill() {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EncryptResult | null>(null);

  async function generate(params: EncryptParams) {
    if (!address) {
      setError("Wallet not connected");
      return;
    }

    if (params.weight < 1 || params.weight > 1000) {
      setError("Weight must be between 1 and 1000.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use real FHE encryption
      const { encryptedSkill, proof } = await encryptSkill(
        params.weight,
        ARC_STRIKE_ARENA_ADDRESS,
        address
      );

      const payload: EncryptResult = {
        weight: params.weight,
        ciphertext: encryptedSkill,
        proof: proof
      };

      setResult(payload);
    } catch (cause) {
      console.error("FHE encryption failed:", cause);
      setError(cause instanceof Error ? cause.message : "Failed to generate encrypted skill.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
    setLoading(false);
  }

  return { loading, error, result, generate, reset };
}
