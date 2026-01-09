"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import SnakeGame from "@/components/snake-game"
import Leaderboard from "@/components/leaderboard"
import CompetitionMode from "@/components/competition-mode"


type GameMode = "menu" | "free-play" | "competition" | "leaderboard"

export default function Home() {
  const [gameMode, setGameMode] = useState<GameMode>("menu")

  const handleGameOver = (score: number, isCompetition: boolean) => {
    console.log("[v0] Game over:", { score, isCompetition })
    // Return to menu after game
    setTimeout(() => setGameMode("menu"), 2000)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center justify-center p-4">
      {gameMode === "menu" && (
        <div className="w-full max-w-md space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-balance mb-8 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Snake Game
          </h1>

          <Card className="p-6 bg-gray-800/50 border-gray-700 backdrop-blur">
            <div className="space-y-3">
              <Button
                onClick={() => setGameMode("free-play")}
                className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
              >
                Start Free Play
              </Button>

              <Button
                onClick={() => setGameMode("competition")}
                className="w-full h-14 text-lg bg-green-600 hover:bg-green-700"
                variant="default"
              >
                Enter Competition
              </Button>

              <Button onClick={() => setGameMode("leaderboard")} className="w-full h-14 text-lg" variant="outline">
                View Leaderboard
              </Button>
            </div>
          </Card>
        </div>
      )}

      {gameMode === "free-play" && (
        <div className="w-full max-w-4xl">
          <Button onClick={() => setGameMode("menu")} variant="outline" className="mb-4">
            ← Back to Menu
          </Button>
          <SnakeGame isCompetitionMode={false} onGameOver={(score) => handleGameOver(score, false)} />
        </div>
      )}

      {gameMode === "competition" && (
        <div className="w-full max-w-4xl">
          <Button onClick={() => setGameMode("menu")} variant="outline" className="mb-4">
            ← Back to Menu
          </Button>
          <CompetitionMode onGameOver={(score) => handleGameOver(score, true)} />
        </div>
      )}

      {gameMode === "leaderboard" && (
        <div className="w-full max-w-4xl">
          <Button onClick={() => setGameMode("menu")} variant="outline" className="mb-4">
            ← Back to Menu
          </Button>
          <Leaderboard />
        </div>
      )}
    </main>
  )
}
