import "@/lib/process-shim";
import "@rainbow-me/rainbowkit/styles.css";

import { PropsWithChildren, useMemo } from "react";
import { WagmiProvider } from "wagmi";
import { sepolia } from "viem/chains";
import { getDefaultConfig, midnightTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "viem";

const config = getDefaultConfig({
  appName: "Arc Strike Arena",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "3fbb6bba6f1de962d911bb5b5c9dba88",
  chains: [sepolia],
  transports: {
    [sepolia.id]: http()
  },
  ssr: false
});

const queryClient = new QueryClient();

export function Providers({ children }: PropsWithChildren) {
  const theme = useMemo(
    () =>
      midnightTheme({
        accentColor: "#7027E0",
        accentColorForeground: "#080A12",
        borderRadius: "large",
        overlayBlur: "small",
        fontStack: "system"
      }),
    []
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={theme} modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
