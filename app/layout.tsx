import type React from "react"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Providers } from "@/lib/providers"
import "./globals.css"
import ClientApp from "./clientApp"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Base verification meta tag — MUST be server-rendered */}
        <meta name="base:app_id" content="69634d0f8a6eeb04b568de1a" />

        {/* Optional Frame / Farcaster tags */}
        <meta name="fc:frame" content="vNext" />
        <meta name="fc:frame:image" content="https://gemini.google.com/share/59dcc48f49a6" />
        <meta name="fc:frame:button:1" content="Play Snake" />
        <meta name="fc:frame:button:1:action" content="link" />
        <meta name="fc:frame:button:1:target" content="https://v0-snake-game-farcaster-mini-app.vercel.app" />
      </head>
      <body className="font-sans antialiased">
        <ClientApp>
          <Providers>{children}</Providers>
        </ClientApp>
        <Analytics />
      </body>
    </html>
  )
}
