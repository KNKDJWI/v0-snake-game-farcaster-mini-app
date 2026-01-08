import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Providers } from "@/lib/providers"
import "./globals.css"
import ClientApp from "./clientApp"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Snake Mini App",
  description: "Classic Snake game with competition mode on Base",
  generator: "v0.app",
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": "https://gemini.google.com/share/59dcc48f49a6",
    "fc:frame:button:1": "Play Snake",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": "https://v0-snake-game-farcaster-mini-app.vercel.app",
  },
  icons: {
    icon: [
      {
        url: "/icon.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.png",
        type: "image/svg+xml",
      },
    ],
    apple: "/icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <Providers>
          <ClientApp>{children}</ClientApp>{/* Farcaster hook live here */}
          </Providers>
        <Analytics />
      </body>
    </html>
  )
}
