import { sdk } from "@farcaster/frame-sdk"
import {
  createWalletClient,
  custom,
  parseEther,
  type EIP1193Provider,
} from "viem"
import { base } from "viem/chains"

const RECIPIENT_ADDRESS = "0x25265b9dBEb6c653b0CA281110Bb0697a9685107"
const PAYMENT_AMOUNT = "0.00001"

export async function farcasterPay() {
  // Get Farcaster-injected provider
  const provider =
    (await sdk.wallet.getEthereumProvider()) as EIP1193Provider

  if (!provider) {
    throw new Error("Farcaster provider not available")
  }

  const client = createWalletClient({
    chain: base,
    transport: custom(provider),
  })

  const [address] = await client.getAddresses()

  if (!address) {
    throw new Error("No Farcaster wallet address found")
  }

  const hash = await client.sendTransaction({
    account: address,
    to: RECIPIENT_ADDRESS,
    value: parseEther(PAYMENT_AMOUNT),
  })

  return hash
}
