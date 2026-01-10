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
  const { connectors, connectAsync } = useConnect()

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
      const isFarcaster =
        typeof window !== "undefined" &&
        window.location.ancestorOrigins?.[0]?.includes("warpcast")

    // ----------------------------
    // FARCASTER FLOW
    // ----------------------------
      if (isFarcaster) {
        const provider =
          (await sdk.wallet.getEthereumProvider()) as EIP1193Provider

        if (!provider) {
          throw new Error("Farcaster wallet not available")
        }

      // 🔑 REQUIRED: explicit wallet connection
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
