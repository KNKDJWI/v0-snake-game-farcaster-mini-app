"use client"

import { useEffect, useState } from "react"
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi"
import { parseEther } from "viem"

const PAYMENT_AMOUNT = "0.00001" // Base ETH
const RECIPIENT_ADDRESS = "0x25265b9dBEb6c653b0CA281110Bb0697a9685107"

export function usePayToCompete() {
  const { address, isConnected } = useAccount()
  const [isPaid, setIsPaid] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: hash, sendTransaction, isPending } = useSendTransaction()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
    pollingInterval: 1000, // check every 1 second
  })

  // Mark as paid when confirmed
  useEffect(() => {
    if (isConfirmed) {
      setIsPaid(true)
    }
  }, [isConfirmed])

  // Timeout fallback: mark as paid after 30s if confirmation is slow
  useEffect(() => {
    if (!hash) return

    const timer = setTimeout(() => {
      if (!isConfirmed) {
        console.warn("Transaction taking too long, marking as paid anyway")
        setIsPaid(true)
      }
    }, 30000) // 30s

    return () => clearTimeout(timer)
  }, [hash, isConfirmed])

  const handlePayment = async () => {
    setError(null)

    if (!isConnected || !address) {
      setError("Wallet not connected")
      return
    }

    if (!sendTransaction) {
      console.error("sendTransaction function is undefined. Wagmi not ready yet.")
      setError("Transaction function not ready")
      return
    }

    const txParams = {
      to: RECIPIENT_ADDRESS as `0x${string}`,
      value: parseEther(PAYMENT_AMOUNT),
    }

    console.log("[Payment] Calling sendTransaction with:", txParams)

    try {
      const tx = await sendTransaction(txParams)
      console.log("[Payment] Transaction sent:", tx)
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
