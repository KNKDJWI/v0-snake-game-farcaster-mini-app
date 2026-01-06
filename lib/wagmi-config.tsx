"use client"

import { createConfig, http } from "wagmi"
import { base } from "wagmi/chains"
import { coinbaseWallet } from "wagmi/connectors"

// Check if running inside Farcaster
const isFarcaster =
  typeof window !== "undefined" &&
  (window.location.ancestorOrigins?.[0]?.includes("warpcast") ||
    window.location.ancestorOrigins?.[0]?.includes("farcaster"))

export const config = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: "Snake Game",
      preference: "smartWalletOnly",
    }),
  ],
  transports: {
    [base.id]: http(),
  },
})
