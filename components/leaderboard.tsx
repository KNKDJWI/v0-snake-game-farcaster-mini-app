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

interface WeekData {
  weekNumber: number
  weekStart: Date
  weekEnd: Date
  entries: LeaderboardEntry[]
}

export default function Leaderboard() {
  const [currentWeek, setCurrentWeek] = useState<WeekData | null>(null)
  const [archivedWeeks, setArchivedWeeks] = useState<WeekData[]>([])
  const [selectedWeek, setSelectedWeek] = useState<"current" | number>("current")
  const [timeToReset, setTimeToReset] = useState("")

  // Calculate the current week and next Sunday at 00:00 UTC
  useEffect(() => {
    const calculateWeekData = () => {
      const now = new Date()
      const dayOfWeek = now.getUTCDay()
      const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek

      // Next Sunday at 00:00 UTC
      const nextSunday = new Date(now)
      nextSunday.setUTCDate(now.getUTCDate() + daysUntilSunday)
      nextSunday.setUTCHours(0, 0, 0, 0)

      // Previous Sunday (week start)
      const weekStart = new Date(nextSunday)
      weekStart.setUTCDate(nextSunday.getUTCDate() - 7)

      // Load current week leaderboard (placeholder - would come from blockchain/database)
      const mockCurrentWeek: WeekData = {
        weekNumber: getWeekNumber(now),
        weekStart,
        weekEnd: nextSunday,
        entries: getMockLeaderboardData(),
      }

      setCurrentWeek(mockCurrentWeek)

      // Load archived weeks (placeholder)
      const mockArchived: WeekData[] = [
        {
          weekNumber: getWeekNumber(now) - 1,
          weekStart: new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000),
          weekEnd: weekStart,
          entries: getMockLeaderboardData(true),
        },
      ]
      setArchivedWeeks(mockArchived)
    }

    calculateWeekData()
  }, [])

  // Countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      if (!currentWeek) return

      const now = new Date()
      const diff = currentWeek.weekEnd.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeToReset("Resetting...")
        // In production, trigger a refresh to load new week
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
  }, [currentWeek])

  // Helper to get week number
  function getWeekNumber(date: Date): number {
    const onejan = new Date(date.getFullYear(), 0, 1)
    const millisecsInDay = 86400000
    return Math.ceil(((date.getTime() - onejan.getTime()) / millisecsInDay + onejan.getDay() + 1) / 7)
  }

  // Mock data - replace with actual blockchain/database queries
  function getMockLeaderboardData(isArchived = false): LeaderboardEntry[] {
    const mockEntries = [
      {
        rank: 1,
        address: "0x1234...5678",
        score: isArchived ? 145 : 187,
        timestamp: Date.now() - 3600000,
      },
      {
        rank: 2,
        address: "0xabcd...efgh",
        score: isArchived ? 132 : 164,
        timestamp: Date.now() - 7200000,
      },
      {
        rank: 3,
        address: "0x9876...4321",
        score: isArchived ? 118 : 152,
        timestamp: Date.now() - 10800000,
      },
    ]

    return mockEntries
  }

  const displayedWeek =
    selectedWeek === "current" ? currentWeek : archivedWeeks.find((w) => w.weekNumber === selectedWeek)

  if (!displayedWeek) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 bg-gray-800/50 border-gray-700 backdrop-blur">
          <div className="text-center text-gray-400">Loading leaderboard...</div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Card className="p-6 bg-gray-800/50 border-gray-700 backdrop-blur">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
          Leaderboard
        </h2>

        {/* Week selector */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          <Button
            onClick={() => setSelectedWeek("current")}
            variant={selectedWeek === "current" ? "default" : "outline"}
            size="sm"
          >
            Current Week
          </Button>
          {archivedWeeks.map((week) => (
            <Button
              key={week.weekNumber}
              onClick={() => setSelectedWeek(week.weekNumber)}
              variant={selectedWeek === week.weekNumber ? "default" : "outline"}
              size="sm"
            >
              Week {week.weekNumber}
            </Button>
          ))}
        </div>

        {/* Countdown timer (only for current week) */}
        {selectedWeek === "current" && (
          <div className="mb-6 p-4 bg-blue-900/20 rounded-lg border border-blue-700">
            <div className="text-center">
              <div className="text-sm text-blue-200 mb-1">Weekly Reset In</div>
              <div className="text-2xl font-bold font-mono text-blue-400">{timeToReset}</div>
              <div className="text-xs text-gray-400 mt-2">Resets every Sunday at 00:00 UTC</div>
            </div>
          </div>
        )}

        {/* Top 3 Leaderboard */}
        <div className="space-y-3">
          {displayedWeek.entries.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="mb-2">No scores yet this week!</p>
              <p className="text-sm">Be the first to enter the competition and claim the top spot.</p>
            </div>
          ) : (
            displayedWeek.entries.map((entry) => (
              <Card
                key={entry.rank}
                className={`p-4 ${
                  entry.rank === 1
                    ? "bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border-yellow-600"
                    : entry.rank === 2
                      ? "bg-gradient-to-r from-gray-700/30 to-gray-600/30 border-gray-500"
                      : entry.rank === 3
                        ? "bg-gradient-to-r from-orange-900/30 to-orange-800/30 border-orange-700"
                        : "bg-gray-800/30 border-gray-700"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Rank Badge */}
                    <div className="shrink-0">
                      {entry.rank === 1 && (
                        <Badge className="bg-yellow-500 text-black text-xl px-4 py-2 font-bold">🥇 1st</Badge>
                      )}
                      {entry.rank === 2 && (
                        <Badge className="bg-gray-400 text-black text-xl px-4 py-2 font-bold">🥈 2nd</Badge>
                      )}
                      {entry.rank === 3 && (
                        <Badge className="bg-orange-600 text-white text-xl px-4 py-2 font-bold">🥉 3rd</Badge>
                      )}
                    </div>

                    {/* Address */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-400 mb-1">Player</div>
                      <div className="font-mono text-sm md:text-base break-all">{entry.address}</div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right shrink-0">
                    <div className="text-sm text-gray-400 mb-1">Score</div>
                    <div className="text-2xl md:text-3xl font-bold text-blue-400">{entry.score}</div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {selectedWeek !== "current" && (
          <div className="mt-6 text-center">
            <Badge variant="outline" className="text-gray-400">
              Archived Week
            </Badge>
          </div>
        )}
      </Card>

      {/* Info Card */}
      <Card className="p-4 bg-gray-800/50 border-gray-700 backdrop-blur">
        <h3 className="font-semibold mb-3 text-center">How It Works</h3>
        <div className="space-y-2 text-sm text-gray-300">
          <p>• Enter competition mode to save your scores on-chain</p>
          <p>• Top 3 players each week are displayed on the leaderboard</p>
          <p>• Leaderboard resets every Sunday at 00:00 UTC</p>
          <p>• Previous weeks are archived and can be viewed anytime</p>
          <p>• Only your highest score counts for the weekly ranking</p>
        </div>
      </Card>
    </div>
  )
}
