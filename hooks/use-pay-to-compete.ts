"use client"

import { useState } from "react"
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi"
import { parseEther } from "viem"
import { base } from "wagmi/chains"

const PAYMENT_AMOUNT = "0.00001" // Base ETH
const RECIPIENT_ADDRESS = "0x0000000000000000000000000000000000000000" // Replace with your address

export function usePayToCompete() {
  const { address, isConnected } = useAccount()
  const [isPaid, setIsPaid] = useState(false)
  const { data: hash, sendTransaction, isPending } = useSendTransaction()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const handlePayment = async () => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected")
    }

    try {
      sendTransaction({
        to: RECIPIENT_ADDRESS as `0x${string}`,
        value: parseEther(PAYMENT_AMOUNT),
        chainId: base.id,
      })
    } catch (error) {
      console.error("[v0] Payment error:", error)
      throw error
    }
  }

  // Update paid status when transaction is confirmed
  if (isConfirmed && !isPaid) {
    setIsPaid(true)
  }

  return {
    address,
    isConnected,
    isPaid,
    isProcessing: isPending || isConfirming,
    handlePayment,
  }
}
