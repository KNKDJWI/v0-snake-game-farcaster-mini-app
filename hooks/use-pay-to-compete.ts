"use client"

import { useEffect, useState } from "react"
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useConnect,
} from "wagmi"
import { parseEther } from "viem"
import { sdk } from "@farcaster/frame-sdk"
import type { EIP1193Provider } from "viem"

const PAYMENT_AMOUNT = "0.00001"
const RECIPIENT_ADDRESS =
  "0x25265b9dBEb6c653b0CA281110Bb0697a9685107"

// 🔒 environment detection happens ONCE
const IS_FARCASTER =
  typeof window !== "undefined" &&
  window.location.ancestorOrigins?.[0]?.includes("warpcast")

export function usePayToCompete() {
  const { isConnected } = useAccount()
  const { connectors, connectAsync } = useConnect()

  const [isPaid, setIsPaid] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: hash, sendTransaction } = useSendTransaction()
  const { isSuccess } = useWaitForTransactionReceipt({
    hash,
    pollingInterval: 1000,
  })

  // ✅ payment state always resets on refresh
  useEffect(() => {
    setIsPaid(false)
    setError(null)
  }, [])

  useEffect(() => {
    if (isSuccess) setIsPaid(true)
  }, [isSuccess])

  const handlePayment = async () => {
    if (isProcessing || isPaid) return

    setIsProcessing(true)
    setError(null)

    // ================================
    // FARCASTER — ISOLATED PATH
    // ================================
    if (IS_FARCASTER) {
      try {
        const provider =
          (await sdk.wallet.getEthereumProvider()) as
            | EIP1193Provider
            | undefined

        if (!provider) {
          setError(
            "Session expired. Close the frame and reopen it to pay again."
          )
          return
        }

        await provider.request({ method: "eth_requestAccounts" })

        await provider.request({
          method: "eth_sendTransaction",
          params: [
            {
              to: RECIPIENT_ADDRESS,
              value: `0x${parseEther(PAYMENT_AMOUNT).toString(16)}`,
            },
          ],
        })

        setIsPaid(true)
        return
      } catch (err: any) {
        console.error("[Farcaster Payment Error]", err)
        setError("Payment failed")
        return
      } finally {
        setIsProcessing(false)
      }
    }

    // ================================
    // BROWSER — ISOLATED PATH
    // ================================
    try {
      if (!isConnected) {
        const injected = connectors.find(c => c.id === "injected")
        if (!injected) throw new Error("No browser wallet found")
        await connectAsync({ connector: injected })
      }

      await sendTransaction({
        to: RECIPIENT_ADDRESS as `0x${string}`,
        value: parseEther(PAYMENT_AMOUNT),
      })
    } catch (err: any) {
      console.error("[Browser Payment Error]", err)
      setError(err?.message || "Transaction failed")
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    isPaid,
    isProcessing,
    error,
    handlePayment,
  }
}
