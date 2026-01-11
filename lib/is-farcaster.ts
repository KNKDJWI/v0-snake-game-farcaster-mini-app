import { sdk } from "@farcaster/frame-sdk"

export async function isFarcaster() {
  try {
    await sdk.actions.ready()
    return true
  } catch {
    return false
  }
}
