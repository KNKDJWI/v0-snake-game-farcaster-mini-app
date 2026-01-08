"use client"

import React, { useEffect } from "react"
import { sdk } from "@farcaster/frame-sdk"

const ClientApp: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    sdk.actions.ready()
  }, [])

  return <>{children}</>
}

export default ClientApp
