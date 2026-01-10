"use client"

import { useEffect, useState } from "react"
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi"
import { parseEther } from "viem"
import { sdk } from "@farcaster/frame-sdk"
import {
  createWalletClient,
  custom,
  type EIP1193Provider,
} from "viem"
import { base } from "viem/chains"

const PAYMENT_AMOUNT = "0.00001"
const RECIPIENT_ADDRESS = "0x25265b9dBEb6c653b0CA281110Bb0697a9685107"

export function usePayToCompete() {
  const { address, isConnected } = useAccount()

  const [isPaid, setIsPaid] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const { data: hash, sendTransaction } = useSendTransaction()

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
    pollingInterval: 1000,
  })

  useEffect(() => {
    if (isConfirmed) setIsPaid(true)
  }, [isConfirmed])

  const isFarcaster =
    typeof window !== "undefined" &&
    window.location.ancestorOrigins?.[0]?.includes("warpcast")

  const handlePayment = async () => {
    setError(null)

    try {
      // -----------------------------
      // FARCASTER FLOW (NO WAGMI)
      // -----------------------------
      if (isFarcaster) {
        setIsProcessing(true)

        const provider =
          (await sdk.wallet.getEthereumProvider()) as EIP1193Provider

        if (!provider) {
          throw new Error("Farcaster wallet not available")
        }

        const client = createWalletClient({
          chain: base,
          transport: custom(provider),
        })

        const [fcAddress] = await client.getAddresses()
        if (!fcAddress) throw new Error("No Farcaster wallet address")

        await client.sendTransaction({
          account: fcAddress,
          to: RECIPIENT_ADDRESS,
          value: parseEther(PAYMENT_AMOUNT),
        })

        setIsPaid(true)
        setIsProcessing(false)
        return
      }

      // -----------------------------
      // BROWSER FLOW (WAGMI)
      // -----------------------------
      if (!isConnected) {
        throw new Error("Please connect your wallet")
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
  }
}
