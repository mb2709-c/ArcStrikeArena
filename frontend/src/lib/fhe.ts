import { getAddress, hexlify } from "ethers";
import { useFheStore } from "@/store/useFheStore";

let fheInstance: any = null;
let sdkPromise: Promise<any> | null = null;

export type EncryptedSkillPayload = {
  handle: `0x${string}`;
  proof: `0x${string}`;
};

/**
 * Get SDK from window (loaded via static script tag in HTML)
 * SDK 0.3.0-5 is loaded via static script tag in index.html
 */
const getSDK = (): any => {
  if (typeof window === "undefined") {
    throw new Error("FHE SDK requires browser environment");
  }

  // Check for both uppercase and lowercase versions
  const sdk = (window as any).RelayerSDK || (window as any).relayerSDK;

  if (!sdk) {
    throw new Error('RelayerSDK not loaded. Please ensure the script tag is in your HTML.');
  }

  return sdk;
};

export const initializeFHE = async (provider?: any): Promise<any> => {
  const { setReady, setInitializing, setError } = useFheStore.getState();

  if (fheInstance) {
    setReady(true);
    setInitializing(false);
    return fheInstance;
  }

  if (typeof window === "undefined") {
    throw new Error("FHE SDK requires browser environment");
  }

  // Get Ethereum provider from multiple sources
  const ethereumProvider = provider ||
    (window as any).ethereum ||
    (window as any).okxwallet?.provider ||
    (window as any).okxwallet;

  if (!ethereumProvider) {
    throw new Error("Ethereum provider not found. Please connect your wallet first.");
  }

  setInitializing(true);
  setError(undefined);
  console.log("🔌 Initializing FHE SDK...");

  const sdk = getSDK();
  const { initSDK, createInstance, SepoliaConfig } = sdk;

  console.log("📦 SDK found, calling initSDK()...");
  await initSDK();
  console.log("✅ SDK initialized");

  const config = { ...SepoliaConfig, network: ethereumProvider };

  try {
    fheInstance = await createInstance(config);
    console.log("✅ FHE instance initialized for Sepolia");
    setReady(true);
    setInitializing(false);
    return fheInstance;
  } catch (error) {
    console.error("❌ createInstance failed:", error);
    setReady(false);
    setInitializing(false);
    setError(error instanceof Error ? error.message : String(error));
    throw error;
  }
};

export const getFHEInstance = (): any => {
  return fheInstance;
};

export const encryptSkill = async (
  skill: bigint,
  contractAddress: string,
  userAddress: string
): Promise<EncryptedSkillPayload> => {
  if (!fheInstance) {
    throw new Error("FHE SDK not initialized. Call initializeFHE first.");
  }

  if (skill <= 0n || skill > 100n) {
    throw new Error("Skill must be between 1 and 100");
  }

  try {
    const input = fheInstance.createEncryptedInput(getAddress(contractAddress), getAddress(userAddress));
    input.add64(skill);

    const { handles, inputProof } = await input.encrypt();

    const handleHex = hexlify(handles[0]) as `0x${string}`;
    const proofHex = hexlify(inputProof) as `0x${string}`;

    return {
      handle: handleHex,
      proof: proofHex
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[FHE] ❌ Encryption failed:", errorMsg);
    throw new Error(`FHE encryption failed: ${errorMsg}`);
  }
};
