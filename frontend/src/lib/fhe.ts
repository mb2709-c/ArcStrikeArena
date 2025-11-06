import { getAddress, hexlify } from 'ethers';

let fheInstance: any = null;

export type EncryptedSkillPayload = {
  handle: `0x${string}`;
  proof: `0x${string}`;
};

export const initializeFHE = async (): Promise<any> => {
  if (fheInstance) {
    return fheInstance;
  }

  if (typeof window === 'undefined') {
    throw new Error('Window object not available');
  }

  const provider = (window as any).ethereum;

  if (!provider) {
    throw new Error('Ethereum provider not found. Please install MetaMask or connect your wallet.');
  }

  try {
    console.log('[FHE] Loading SDK...');
    const { createInstance, initSDK, SepoliaConfig } = await import('@zama-fhe/relayer-sdk/bundle');

    console.log('[FHE] Initializing WASM...');
    await initSDK();

    console.log('[FHE] Creating instance with network provider...');
    fheInstance = await createInstance({
      ...SepoliaConfig,
      network: provider,
      gatewayUrl: 'https://gateway.zama.ai'
    });

    console.log('[FHE] ✅ Initialized successfully');
    return fheInstance;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[FHE] ❌ Initialization failed:', errorMsg);
    throw new Error(`FHE initialization failed: ${errorMsg}`);
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
    throw new Error('FHE SDK not initialized. Call initializeFHE first.');
  }

  if (skill <= 0n || skill > 100n) {
    throw new Error('Skill must be between 1 and 100');
  }

  try {
    console.log(`[FHE] Encrypting skill ${skill} for contract ${contractAddress}`);
    console.log(`[FHE] Contract: ${contractAddress}, User: ${userAddress}`);

    const input = fheInstance.createEncryptedInput(getAddress(contractAddress), getAddress(userAddress));
    console.log('[FHE] Created encrypted input');

    input.add64(skill);
    console.log('[FHE] Added u64 value:', skill);

    // encrypt() returns { handles: Uint8Array[], inputProof: Uint8Array }
    const { handles, inputProof } = await input.encrypt();

    console.log('[FHE] Encryption complete');
    console.log('[FHE] Handle:', handles[0]);
    console.log('[FHE] Proof:', inputProof);

    // Convert Uint8Array to hex string using ethers hexlify
    const handleHex = hexlify(handles[0]) as `0x${string}`;
    const proofHex = hexlify(inputProof) as `0x${string}`;

    console.log('[FHE] Handle (hex):', handleHex);
    console.log('[FHE] Proof (hex):', proofHex);

    return {
      handle: handleHex,
      proof: proofHex
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[FHE] ❌ Encryption failed:', errorMsg);
    console.error('[FHE] Error stack:', error);
    throw new Error(`FHE encryption failed: ${errorMsg}`);
  }
};
