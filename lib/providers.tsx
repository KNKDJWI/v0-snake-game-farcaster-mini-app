"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { config } from "./wagmi-config"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [isFarcaster, setIsFarcaster] = useState<boolean | null>(null)

  useEffect(() => {
    const fc =
      typeof window !== "undefined" &&
      window.location.ancestorOrigins?.[0]?.includes("warpcast")

    setIsFarcaster(fc)
  }, [])

  // ⛔ Wait until environment is known
  if (isFarcaster === null) {
    return null
  }

  // ✅ Farcaster → NO wagmi
  if (isFarcaster) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }

  // ✅ Browser → wagmi allowed
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
