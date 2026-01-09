"use client"

import { useEffect, useState } from "react"
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useConnect,
} from "wagmi"
import { injected, coinbaseWallet } from "wagmi/connectors"
import { parseEther } from "viem"

const PAYMENT_AMOUNT = "0.00001" // Base ETH
const RECIPIENT_ADDRESS = "0x25265b9dBEb6c653b0CA281110Bb0697a9685107"

export function usePayToCompete() {
  const { address, isConnected } = useAccount()
  const { connectAsync, connectors } = useConnect()

  const [isPaid, setIsPaid] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: hash, sendTransaction, isPending } = useSendTransaction()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
      pollingInterval: 1000,
    })

  // Mark as paid when confirmed
  useEffect(() => {
    if (isConfirmed) setIsPaid(true)
  }, [isConfirmed])

  // Fallback: mark paid if confirmation is slow
  useEffect(() => {
    if (!hash) return

    const timer = setTimeout(() => {
      if (!isConfirmed) {
        console.warn("Confirmation slow — proceeding anyway")
        setIsPaid(true)
      }
    }, 30000)

    return () => clearTimeout(timer)
  }, [hash, isConfirmed])

  const handlePayment = async () => {
    setError(null)

    try {
      // Auto-connect if wallet not connected
      if (!isConnected) {
        const isFarcaster =
          typeof window !== "undefined" &&
          window.location.ancestorOrigins?.[0]?.includes("warpcast")

        const connector = isFarcaster
          ? connectors.find(c => c.id === "coinbaseWalletSDK")!
          : connectors.find(c => c.id === "injected")!

        await connectAsync({ connector })

        // Wait a tick so useAccount updates
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      if (!address) throw new Error("Wallet not connected")
      if (!sendTransaction) throw new Error("Transaction not ready")

      await sendTransaction({
        to: RECIPIENT_ADDRESS as `0x${string}`,
        value: parseEther(PAYMENT_AMOUNT),
      })
    } catch (err: any) {
      console.error("[Payment Error]", err)
      setError(err?.message || "Transaction failed")
    }
  }

  return {
    address,
    isConnected,
    isPaid,
    isProcessing: isPending || isConfirming,
    handlePayment,
    error,
  }
}
