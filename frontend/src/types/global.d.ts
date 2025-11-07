interface RelayerSDKModule {
  initSDK: () => Promise<void>;
  createInstance: (config: Record<string, unknown>) => Promise<any>;
  SepoliaConfig: Record<string, unknown>;
}

declare global {
  interface Window {
    relayerSDK?: RelayerSDKModule;
    RelayerSDK?: RelayerSDKModule;
  }
}

export {};
