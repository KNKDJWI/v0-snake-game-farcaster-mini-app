"use client"

import { useEffect } from "react"
import { sdk } from "@farcaster/frame-sdk"

export default function ClientApp({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // This is the critical line Farcaster needs
    sdk.actions.ready()
  }, [])

  return <>{children}</>
}
