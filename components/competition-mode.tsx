"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { usePayToCompete } from "@/hooks/use-pay-to-compete"
import SnakeGame from "@/components/snake-game"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CompetitionModeProps {
  onGameOver: (score: number) => void
}
const IS_FARCASTER =
  typeof window !== "undefined" &&
  window.location.ancestorOrigins?.[0]?.includes("warpcast")


export default function CompetitionMode({ onGameOver }: CompetitionModeProps) {
  const [address, setAddress] = useState<string | null>(null)

  useEffect(() => {
    if (IS_FARCASTER) {
    // Optional: get Farcaster-connected address later if needed
      setAddress(null)
    }
  }, [])

  const { isPaid, isProcessing, handlePayment, error } = usePayToCompete()
  const [gameStarted, setGameStarted] = useState(false)
  const [currentScore, setCurrentScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [showFinalScore, setShowFinalScore] = useState(false)
  const [isNewHighScore, setIsNewHighScore] = useState(false)

  // Load high score from localStorage (placeholder for on-chain storage)
  useEffect(() => {
    if (!address) return
    const stored = localStorage.getItem(`highscore_${address}`)
    if (stored) setHighScore(Number.parseInt(stored, 10))
  }, [address])


  // Start the game automatically once payment is confirmed
  useEffect(() => {
    if (isPaid && !gameStarted && !showFinalScore) {
      setGameStarted(true)
      setCurrentScore(0)
    }
  }, [isPaid, gameStarted, showFinalScore])

  const handleStartCompetition = async () => {
    setShowFinalScore(false)
    setCurrentScore(0)
    if (!isPaid) {
      await handlePayment()
    }
    // Do NOT set gameStarted here — wait for useEffect after payment confirmation
  }

  const handleGameComplete = (score: number) => {
    setCurrentScore(score)
    setShowFinalScore(true)
    setGameStarted(false)

    // Check for new high score
    if (score > highScore) {
      setHighScore(score)
      setIsNewHighScore(true)
      if (address) {
        localStorage.setItem(`highscore_${address}`, score.toString())
        saveScoreOnChain(address, score)
      }
    } else {
      setIsNewHighScore(false)
    }

    console.log("Game over",score)
  }

  // Placeholder function for saving score on-chain
  const saveScoreOnChain = async (walletAddress: string, score: number) => {
    console.log("[v1] Saving score on-chain:", { walletAddress, score })
    // TODO: Implement actual on-chain storage
  }



  if (!isPaid && !gameStarted) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="p-6 bg-gray-800/50 border-gray-700 backdrop-blur">
          <h2 className="text-2xl font-bold mb-4 text-center">Enter Competition</h2>

          <div className="mb-6 p-4 bg-gray-900/50 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Connected Wallet</div>
            <div className="font-mono text-sm break-all">{address}</div>
          </div>

          {highScore > 0 && (
            <div className="mb-6 p-4 bg-blue-900/20 rounded-lg border border-blue-700">
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">Your High Score</div>
                <div className="text-3xl font-bold text-blue-400">{highScore}</div>
              </div>
            </div>
          )}

          <Alert className="mb-6 bg-green-900/20 border-green-700">
            <AlertDescription className="text-sm text-green-200">
              <strong>Competition Benefits:</strong>
              <ul className="mt-2 ml-4 list-disc space-y-1">
                <li>Scores saved on-chain</li>
                <li>Compete on weekly leaderboard</li>
                <li>Eligible for top 3 rankings</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="mb-6 p-4 bg-yellow-900/20 rounded-lg border border-yellow-700">
            <div className="text-center">
              <div className="text-sm text-yellow-200 mb-2">Entry Fee</div>
              <div className="text-2xl font-bold text-yellow-400">0.00001 Base ETH</div>
            </div>
          </div>

          {error && (
            <Alert className="mb-4 bg-red-900/20 border-red-700">
              <AlertDescription className="text-sm text-red-200 text-center">{error}</AlertDescription>
            </Alert>
          )}

          {/* --- Dynamic Payment Button --- */}
          <Button
            onClick={handleStartCompetition}
            disabled={isProcessing || isPaid} // disable while processing or already paid
            className="w-full h-14 text-lg bg-green-600 hover:bg-green-700"
          >
            {isProcessing
              ? "Processing Payment..."
              : isPaid
              ? "Payment Confirmed! Starting..."
              : "Pay & Start Competition"}
          </Button>
        </Card>
      </div>
    )
  }

  if (showFinalScore) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="p-6 bg-gray-800/50 border-gray-700 backdrop-blur">
          <h2 className="text-2xl font-bold mb-4 text-center">Competition Complete!</h2>

          {isNewHighScore && (
            <Alert className="mb-6 bg-green-900/20 border-green-700">
              <AlertDescription className="text-center text-green-200 font-semibold text-lg">
                🎉 New High Score! 🎉
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 mb-6">
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">Final Score</div>
                <div className="text-4xl font-bold text-blue-400">{currentScore}</div>
              </div>
            </div>

            <div className="p-4 bg-gray-900/50 rounded-lg">
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">High Score</div>
                <div className="text-2xl font-bold text-green-400">{highScore}</div>
              </div>
            </div>
          </div>

          <Alert className="mb-6 bg-blue-900/20 border-blue-700">
            <AlertDescription className="text-sm text-blue-200 text-center">
              {isNewHighScore
                ? "Your new high score has been saved on-chain!"
                : "Keep playing to beat your high score!"}
            </AlertDescription>
          </Alert>

          <Button onClick={handleStartCompetition} className="w-full h-14 text-lg bg-green-600 hover:bg-green-700">
            Play Again
          </Button>
        </Card>
      </div>
    )
  }

  // --- Game UI ---
  return (
    <div>
      <Card className="p-4 bg-gray-800/50 border-gray-700 backdrop-blur mb-4">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div>
            <div className="text-sm text-gray-400">Current Score</div>
            <div className="text-2xl font-bold text-blue-400">{currentScore}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">High Score</div>
            <div className="text-xl font-bold text-green-400">{highScore}</div>
          </div>
          <div className="text-xs text-gray-400 font-mono break-all max-w-[200px]">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </div>
        </div>
      </Card>

      <SnakeGame
        isCompetitionMode={true}
        onGameOver={handleGameComplete}
        onScoreUpdate={(score) => setCurrentScore(score)}
      />
    </div>
  )
}
