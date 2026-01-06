# Snake Game - Farcaster Mini App

A fully responsive classic Snake game built with React, Next.js, and HTML Canvas, integrated as a Farcaster mini app with competition mode and on-chain leaderboard.

## Features

### Game Modes

1. **Free Play** - Play without wallet connection, scores are not saved
2. **Competition Mode** - Requires 0.00001 Base ETH payment to enter, saves high scores on-chain
3. **Leaderboard** - View top 3 players for current week and archived weeks

### Gameplay

- Classic Snake mechanics with smooth canvas rendering
- **Blue snake** on dark background
- Score based on snake length
- Responsive controls:
  - Desktop: Arrow keys, Space to pause
  - Mobile: Swipe gestures or on-screen control buttons

### Difficulty System

- **Walls spawn** when snake reaches length 10
- **Screen wraparound disabled** after walls appear
- Collision with walls or self causes game over

### Special Items

- **Food (Green)** - Common, increases snake by 1, +1 score
- **Big Food (Orange)** - Common, increases snake by 3, +3 score
- **Bomb (Red)** - Common, reduces snake size or causes game over
- **Heart (Pink)** - Very rare, grants extra life, +5 score
- All items spawn randomly and expire after a short duration

### Audio Feedback

- Sound effects for eating food, hitting bombs, collecting hearts, and game over
- Uses Web Audio API for simple beep sounds

## Farcaster Mini App Integration

### Setup

The app uses:
- `@farcaster/miniapp-sdk` for mini app functionality
- `wagmi` for Web3 wallet connection
- `@tanstack/react-query` for data fetching
- `viem` for Ethereum interactions

### Competition Flow

1. User clicks **Enter Competition**
2. Prompted to connect Farcaster wallet (Coinbase Smart Wallet)
3. Must send **0.00001 Base ETH** transaction
4. After confirmation, can play and save high scores
5. Scores saved on-chain (placeholder implementation included)
6. Eligible for weekly leaderboard

### Manifest

The `farcaster.json` manifest file configures the mini app:

\`\`\`json
{
  "name": "Snake Game",
  "version": "1.0.0",
  "description": "A classic Snake game with competition mode and leaderboard",
  "splashBackgroundColor": "#000000",
  "homeUrl": "/",
  "iconUrl": "/icon.png"
}
\`\`\`

### Meta Tags

The app includes Farcaster frame meta tags in `app/layout.tsx` for proper embedding:

\`\`\`tsx
other: {
  "fc:frame": "vNext",
  "fc:frame:image": "https://yourdomain.com/preview.png",
  "fc:frame:button:1": "Play Snake",
  "fc:frame:button:1:action": "link",
  "fc:frame:button:1:target": "https://yourdomain.com",
}
\`\`\`

## Leaderboard System

- Shows **Top 3 players** for current week
- Countdown timer to Sunday 00:00 UTC reset
- **Weekly archives** - Previous weeks remain viewable
- Only highest score per wallet counts

## Installation

\`\`\`bash
npm install
npm run dev
\`\`\`

Visit `http://localhost:3000` to play locally.

## Configuration

### Update Payment Recipient

In `hooks/use-pay-to-compete.ts`, update the recipient address:

\`\`\`tsx
const RECIPIENT_ADDRESS = "0xYourAddressHere"
\`\`\`

### Implement On-Chain Storage

The current implementation uses localStorage as a placeholder. To implement real on-chain storage:

1. Deploy a smart contract to store scores (Base network)
2. Update `saveScoreOnChain` function in `components/competition-mode.tsx`
3. Implement leaderboard data fetching from blockchain in `components/leaderboard.tsx`

## Project Structure

\`\`\`
├── app/
│   ├── layout.tsx          # Root layout with Wagmi providers
│   ├── page.tsx            # Main game navigation
│   └── globals.css         # Global styles
├── components/
│   ├── snake-game.tsx      # Core game logic and canvas rendering
│   ├── competition-mode.tsx # Payment flow and competition logic
│   ├── leaderboard.tsx     # Leaderboard display and week management
│   └── ui/                 # shadcn/ui components
├── hooks/
│   ├── use-pay-to-compete.ts # Wallet connection and payment hook
│   ├── use-mobile.tsx       # Mobile detection hook
│   └── use-toast.ts         # Toast notifications
├── lib/
│   ├── wagmi-config.tsx    # Wagmi configuration for Farcaster
│   ├── providers.tsx       # React Query + Wagmi providers
│   └── utils.ts            # Utility functions
└── farcaster.json          # Farcaster mini app manifest
\`\`\`

## Deployment

### Deploy to Vercel

\`\`\`bash
vercel
\`\`\`

### Environment Variables

No environment variables required for basic functionality. If you add external APIs or database integrations, configure them in your Vercel project settings.

## Technologies

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - UI components
- **Wagmi** - Web3 hooks
- **Viem** - Ethereum utilities
- **HTML Canvas** - Game rendering
- **Base Network** - Ethereum L2 for payments and storage

## License

MIT

## Contributing

Contributions welcome! Please open an issue or submit a pull request.
