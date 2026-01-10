"use client"

import { createConfig, http } from "wagmi"
import { base } from "wagmi/chains"
import { coinbaseWallet } from "wagmi/connectors"

export const config = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: "Snake Mini App",
      preference: "smartWalletOnly",
    }),
  ],
  transports: {
    [base.id]: http(),
  },
})
