"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface LeaderboardEntry {
  rank: number
  address: string
  score: number
  timestamp: number
}

interface LeaderboardScore {
  address: string
  score: number
  timestamp: number
}

export default function Leaderboard() {
  const [weeklyTop, setWeeklyTop] = useState<LeaderboardEntry[]>([])
  const [weekRange, setWeekRange] = useState<{ start: Date; end: Date } | null>(null)
  const [timeToReset, setTimeToReset] = useState("")

  // ---------- HELPERS ----------
  function getUTCDateKey(date = new Date()) {
    return date.toISOString().slice(0, 10) // YYYY-MM-DD
  }

  // ---------- CALCULATE CURRENT WEEK ----------
  useEffect(() => {
    const now = new Date()
    const dayOfWeek = now.getUTCDay()
    const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek

    const nextSunday = new Date(now)
    nextSunday.setUTCDate(now.getUTCDate() + daysUntilSunday)
    nextSunday.setUTCHours(0, 0, 0, 0)

    const weekStart = new Date(nextSunday)
    weekStart.setUTCDate(nextSunday.getUTCDate() - 7)

    setWeekRange({ start: weekStart, end: nextSunday })
  }, [])

  // ---------- COUNTDOWN TIMER ----------
  useEffect(() => {
    if (!weekRange) return

    const updateCountdown = () => {
      const now = new Date()
      const diff = weekRange.end.getTime() - now.getTime()
      if (diff <= 0) {
        setTimeToReset("Resetting...")
        return
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setTimeToReset(`${days}d ${hours}h ${minutes}m ${seconds}s`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [weekRange])

  // ---------- LOAD WEEKLY TOP 10 ----------
  function loadWeeklyTop() {
    if (!weekRange) return
    let allScores: LeaderboardScore[] = []

    // Collect scores from localStorage for each day of the week
    for (let d = new Date(weekRange.start); d < weekRange.end; d.setUTCDate(d.getUTCDate() + 1)) {
      const key = getUTCDateKey(d)
      const raw = localStorage.getItem(`competition_scores_${key}`)
      if (!raw) continue
      const dailyScores: LeaderboardScore[] = JSON.parse(raw)
      allScores.push(...dailyScores)
    }

    // Keep only highest score per wallet
    const bestByWallet = new Map<string, LeaderboardScore>()
    for (const s of allScores) {
      const prev = bestByWallet.get(s.address)
      if (!prev || s.score > prev.score) bestByWallet.set(s.address, s)
    }

    // Sort and pick top 10
    const top10 = Array.from(bestByWallet.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((entry, index) => ({ rank: index + 1, ...entry }))

    setWeeklyTop(top10)
  }

  // ---------- REFRESH EVERY 24H ----------
  useEffect(() => {
    loadWeeklyTop()
    const interval = setInterval(() => {
      loadWeeklyTop()
    }, 24 * 60 * 60 * 1000) // 24 hours
    return () => clearInterval(interval)
  }, [weekRange])

  // ---------- RENDER ----------
  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      {/* Countdown */}
      <Card className="p-6 bg-gray-900/50 border-gray-700 backdrop-blur rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4">Weekly Reset Countdown</h2>
        <div className="text-center text-3xl font-mono font-bold text-blue-400">{timeToReset}</div>
        <div className="text-center text-sm text-gray-400 mt-2">Resets every Sunday at 00:00 UTC</div>
      </Card>

      {/* Weekly Top 10 Leaderboard */}
      <Card className="p-6 bg-gray-900/50 border-gray-700 backdrop-blur rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Weekly Top 10</h2>
        <div className="space-y-3">
          {weeklyTop.length === 0 ? (
            <div className="text-center text-gray-400 py-12">No scores this week yet!</div>
          ) : (
            weeklyTop.map((entry) => (
              <Card
                key={entry.rank}
                className={`p-4 ${
                  entry.rank === 1
                    ? "bg-yellow-800/30 border-yellow-500"
                    : entry.rank === 2
                    ? "bg-gray-700/30 border-gray-500"
                    : entry.rank === 3
                    ? "bg-orange-800/30 border-orange-600"
                    : "bg-gray-800/30 border-gray-700"
                } rounded-lg`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="shrink-0">
                      {entry.rank === 1 && <Badge className="bg-yellow-500 text-black px-3 py-1 font-bold">🥇 1st</Badge>}
                      {entry.rank === 2 && <Badge className="bg-gray-400 text-black px-3 py-1 font-bold">🥈 2nd</Badge>}
                      {entry.rank === 3 && <Badge className="bg-orange-600 text-white px-3 py-1 font-bold">🥉 3rd</Badge>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-400 mb-1">Player</div>
                      <div className="font-mono text-sm md:text-base break-all">{entry.address}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm text-gray-400 mb-1">Score</div>
                    <div className="text-2xl font-bold text-blue-400">{entry.score}</div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>

      {/* Info Section */}
      <Card className="p-6 bg-gray-900/50 border-gray-700 backdrop-blur rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">How It Works</h2>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>Top 10 scores are tracked weekly (Sunday 00:00 UTC → next Sunday 00:00 UTC)</li>
          <li>Leaderboard refreshes every 24 hours automatically</li>
          <li>Only your highest score counts for ranking</li>
          <li>Players can move up or down as scores improve</li>
        </ul>
      </Card>
    </div>
  )
}
