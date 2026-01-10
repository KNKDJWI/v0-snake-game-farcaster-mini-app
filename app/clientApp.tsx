"use client"

import { useEffect, useState } from "react"
import { sdk } from "@farcaster/frame-sdk"

export default function ClientApp({
  children,
}: {
  children: React.ReactNode
}) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    sdk.actions.ready().then(() => {
      setReady(true)
    })
  }, [])

  if (!ready) return null

  return <>{children}</>
}
