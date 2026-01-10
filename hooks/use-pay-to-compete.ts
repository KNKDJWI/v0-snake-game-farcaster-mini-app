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
import { type EIP1193Provider } from "viem"

const PAYMENT_AMOUNT = "0.00001"
const RECIPIENT_ADDRESS = "0x25265b9dBEb6c653b0CA281110Bb0697a9685107"
const FARCASTER_PAID_KEY = "farcasterPaid"

export function usePayToCompete() {
  const { address, isConnected } = useAccount()
  const { connectors, connectAsync } = useConnect()

  const [isPaid, setIsPaid] = useState(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem(FARCASTER_PAID_KEY)
    }
    return false
  })
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [needsReload, setNeedsReload] = useState(false)

  const { data: hash, sendTransaction } = useSendTransaction()

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
    pollingInterval: 1000,
  })

  useEffect(() => {
    if (isConfirmed) setIsPaid(true)
  }, [isConfirmed])

  const handlePayment = async () => {
    setError(null)
    setNeedsReload(false)
    setIsProcessing(true)

    try {
      const isFarcaster =
        typeof window !== "undefined" &&
        !!(window as any)?.FarcasterFrame

      // ----------------------------
      // FARCASTER FLOW
      // ----------------------------
      if (isFarcaster) {
        let provider = (await sdk.wallet.getEthereumProvider()) as
          | EIP1193Provider
          | undefined

        if (!provider) {
          // Farcaster session expired
          setNeedsReload(true)
          setIsProcessing(false)
          return
        }

        // 🔑 Explicit wallet connection
        await provider.request({ method: "eth_requestAccounts" })

        // send tx
        await provider.request({
          method: "eth_sendTransaction",
          params: [
            {
              to: RECIPIENT_ADDRESS,
              value: `0x${parseEther(PAYMENT_AMOUNT).toString(16)}`,
            },
          ],
        })

        if (typeof window !== "undefined") {
          localStorage.setItem(FARCASTER_PAID_KEY, "true")
        }

        setIsPaid(true)
        setIsProcessing(false)
        return
      }

      // ----------------------------
      // BROWSER FLOW (wagmi)
      // ----------------------------
      if (!isConnected) {
        const injectedConnector = connectors.find(c => c.id === "injected")
        if (!injectedConnector) throw new Error("No browser wallet found")
        await connectAsync({ connector: injectedConnector })
      }

      if (!sendTransaction) {
        throw new Error("Transaction not ready")
      }

      await sendTransaction({
        to: RECIPIENT_ADDRESS as `0x${string}`,
        value: parseEther(PAYMENT_AMOUNT),
      })
    } catch (err: any) {
      console.error("[Payment Error]", err)
      setError(err?.message || "Transaction failed")
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    address,
    isConnected,
    isPaid,
    isProcessing,
    handlePayment,
    error,
    needsReload, // <- if true, UI can show "Reload Warpcast to pay"
  }
}
