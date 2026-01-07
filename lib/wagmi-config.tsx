import { createConfig, http } from "wagmi"
import { base } from "wagmi/chains"
import { coinbaseWallet, injected } from "wagmi/connectors"

// Detect Farcaster / Warpcast iframe
const isFarcaster =
  typeof window !== "undefined" &&
  (window.location.ancestorOrigins?.[0]?.includes("warpcast") ||
   window.location.ancestorOrigins?.[0]?.includes("farcaster"))

export const config = createConfig({
  chains: [base],
  connectors: isFarcaster
    ? [
        coinbaseWallet({
          appName: "Snake Game",
          preference: "smartWalletOnly",
        }),
      ]
    : [
        injected(), // MetaMask / Coinbase Extension for localhost
      ],
  transports: {
    [base.id]: http(),
  },
})
