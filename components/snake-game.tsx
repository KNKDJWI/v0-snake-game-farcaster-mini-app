"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"

interface Position {
  x: number
  y: number
}

interface SnakeGameProps {
  isCompetitionMode: boolean
  onGameOver: (score: number) => void
  onScoreUpdate?: (score: number) => void
}

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT"
type ItemType = "food" | "bigFood" | "bomb" | "heart"

interface GameItem {
  position: Position
  type: ItemType
  expiresAt: number
}

const GRID_SIZE = 20
const CELL_SIZE = 20
const INITIAL_SPEED = 150
const SPEED_INCREMENT = 10
const MAX_SPEED = 50

// Difficulty thresholds
const WALL_SPAWN_LENGTH = 10

export default function SnakeGame({ isCompetitionMode, onGameOver, onScoreUpdate }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }])
  const [direction, setDirection] = useState<Direction>("RIGHT")
  const [nextDirection, setNextDirection] = useState<Direction>("RIGHT")
  const [items, setItems] = useState<GameItem[]>([])
  const [walls, setWalls] = useState<Position[]>([])
  const [score, setScore] = useState(0)
  const lastReportedScoreRef = useRef(score)
  const [lives, setLives] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  const [gamePaused, setGamePaused] = useState(false)
  const [speed, setSpeed] = useState(INITIAL_SPEED)
  const [wallsEnabled, setWallsEnabled] = useState(false)
  const isMobile = useMobile()

  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  // Generate random position
  const getRandomPosition = useCallback((avoidPositions: Position[] = []): Position => {
    let position: Position
    let attempts = 0
    do {
      position = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      }
      attempts++
    } while (attempts < 100 && avoidPositions.some((p) => p.x === position.x && p.y === position.y))
    return position
  }, [])

  // Notify parent after game ends
useEffect(() => {
  if (gameOver) {
    onGameOver(score)
  }
}, [gameOver, score, onGameOver])

useEffect(() => {
  if (!onScoreUpdate) return
    
  if (score !== lastReportedScoreRef.current) {
    lastReportedScoreRef.current = score
    onScoreUpdate(score)
  }
}, [score, onScoreUpdate])


  // Spawn initial food
  useEffect(() => {
    if (items.length === 0 && !gameOver) {
      setItems([
        {
          position: getRandomPosition(snake),
          type: "food",
          expiresAt: Date.now() + 30000,
        },
      ])
    }
  }, [items.length, gameOver, snake, getRandomPosition])

  // Spawn walls when snake reaches threshold
  useEffect(() => {
    if (snake.length >= WALL_SPAWN_LENGTH && !wallsEnabled) {
      setWallsEnabled(true)
      const newWalls: Position[] = []
      const numWalls = 5
      for (let i = 0; i < numWalls; i++) {
        newWalls.push(getRandomPosition([...snake, ...newWalls]))
      }
      setWalls(newWalls)
    }
  }, [snake.length, wallsEnabled, snake, getRandomPosition])

  // Spawn random items
  const spawnRandomItem = useCallback(() => {
    if (Math.random() < 0.3) {
      const rand = Math.random()
      let type: ItemType = "food"
      let duration = 30000

      if (rand < 0.02) {
        // 2% chance for heart
        type = "heart"
        duration = 10000
      } else if (rand < 0.15) {
        // 13% chance for bomb
        type = "bomb"
        duration = 8000
      } else if (rand < 0.35) {
        // 20% chance for big food
        type = "bigFood"
        duration = 12000
      }

      if (type !== "food") {
        setItems((prev) => [
          ...prev,
          {
            position: getRandomPosition([...snake, ...walls]),
            type,
            expiresAt: Date.now() + duration,
          },
        ])
      }
    }
  }, [snake, walls, getRandomPosition])

  // Game loop
  useEffect(() => {
    if (gameOver || gamePaused) return

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = prevSnake[0]
        let newHead: Position

        // Apply direction change
        setDirection(nextDirection)
        const currentDirection = nextDirection

        // Calculate new head position
        switch (currentDirection) {
          case "UP":
            newHead = { x: head.x, y: head.y - 1 }
            break
          case "DOWN":
            newHead = { x: head.x, y: head.y + 1 }
            break
          case "LEFT":
            newHead = { x: head.x - 1, y: head.y }
            break
          case "RIGHT":
            newHead = { x: head.x + 1, y: head.y }
            break
        }

        // Check wall collision if walls are enabled
        if (wallsEnabled) {
          // Check boundary collision
          if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
            setGameOver(true)
            playSound("gameOver")
            return prevSnake
          }

          // Check wall collision
          if (walls.some((wall) => wall.x === newHead.x && wall.y === newHead.y)) {
            setGameOver(true)
            playSound("gameOver")
            return prevSnake
          }
        } else {
          // Screen wraparound when walls not enabled
          newHead.x = (newHead.x + GRID_SIZE) % GRID_SIZE
          newHead.y = (newHead.y + GRID_SIZE) % GRID_SIZE
        }

        // Check self collision
        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true)
          playSound("gameOver")
          return prevSnake
        }

        // Check item collision
        const hitItem = items.find((item) => item.position.x === newHead.x && item.position.y === newHead.y)

        let newSnake = [newHead, ...prevSnake]

        if (hitItem) {
          setItems((prev) => prev.filter((item) => item !== hitItem))

          switch (hitItem.type) {
            case "food":
              setScore((s) => s + 1)
            
              playSound("food")
              // Increase speed every 5 points
              if ((score + 1) % 5 === 0 && speed > MAX_SPEED) {
                setSpeed((s) => s - SPEED_INCREMENT)
              }
              break

            case "bigFood":
              setScore((s) => s + 3) 
              newSnake = [newHead, ...prevSnake, prevSnake[prevSnake.length - 1], prevSnake[prevSnake.length - 1]]
              playSound("food")
              break

            case "bomb":
              if (lives > 1) {
                setLives((l) => l - 1)
                // Reduce snake size
                newSnake = newSnake.slice(0, Math.max(3, Math.floor(newSnake.length / 2)))
                playSound("bomb")
              } else {
                setGameOver(true)
                playSound("gameOver")
                return prevSnake
              }
              break

            case "heart":
              setLives((l) => l + 1)
              setScore((s) => s + 5)
              playSound("heart")
              break
          }

          // Spawn new food if needed
          if (hitItem.type === "food") {
            setItems((prev) => [
              ...prev,
              {
                position: getRandomPosition([...newSnake, ...walls]),
                type: "food",
                expiresAt: Date.now() + 30000,
              },
            ])
          }

          spawnRandomItem()
        } else {
          // Remove tail if no food eaten
          newSnake.pop()
        }

        return newSnake
      })

      // Remove expired items
      setItems((prev) => prev.filter((item) => item.expiresAt > Date.now()))
    }

    const gameInterval = setInterval(moveSnake, speed)
    return () => clearInterval(gameInterval)
  }, [
    direction,
    nextDirection,
    gameOver,
    gamePaused,
    items,
    walls,
    wallsEnabled,
    score,
    lives,
    speed,
    snake,
    onGameOver,
    onScoreUpdate,
    spawnRandomItem,
    getRandomPosition,
  ])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault()
          if (direction !== "DOWN") setNextDirection("UP")
          break
        case "ArrowDown":
          e.preventDefault()
          if (direction !== "UP") setNextDirection("DOWN")
          break
        case "ArrowLeft":
          e.preventDefault()
          if (direction !== "RIGHT") setNextDirection("LEFT")
          break
        case "ArrowRight":
          e.preventDefault()
          if (direction !== "LEFT") setNextDirection("RIGHT")
          break
        case " ":
          e.preventDefault()
          setGamePaused((p) => !p)
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [direction, gameOver])

  // Touch controls for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y

    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    if (absX > 20 || absY > 20) {
      if (absX > absY) {
        // Horizontal swipe
        if (deltaX > 0 && direction !== "LEFT") {
          setNextDirection("RIGHT")
        } else if (deltaX < 0 && direction !== "RIGHT") {
          setNextDirection("LEFT")
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && direction !== "UP") {
          setNextDirection("DOWN")
        } else if (deltaY < 0 && direction !== "DOWN") {
          setNextDirection("UP")
        }
      }
    }

    touchStartRef.current = null
  }


  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "#0a0a0a"
    ctx.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE)

    // Draw grid
    ctx.strokeStyle = "#1a1a1a"
    ctx.lineWidth = 1
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath()
      ctx.moveTo(i * CELL_SIZE, 0)
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0, i * CELL_SIZE)
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE)
      ctx.stroke()
    }

    // Draw walls
    walls.forEach((wall) => {
      ctx.fillStyle = "#8b4513"
      ctx.fillRect(wall.x * CELL_SIZE, wall.y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
      ctx.strokeStyle = "#654321"
      ctx.lineWidth = 2
      ctx.strokeRect(wall.x * CELL_SIZE, wall.y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
    })

    // Draw items
    items.forEach((item) => {
      const x = item.position.x * CELL_SIZE
      const y = item.position.y * CELL_SIZE

      switch (item.type) {
        case "food":
          ctx.fillStyle = "#22c55e"
          ctx.beginPath()
          ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE / 3, 0, Math.PI * 2)
          ctx.fill()
          break

        case "bigFood":
          ctx.fillStyle = "#f59e0b"
          ctx.beginPath()
          ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE / 2.5, 0, Math.PI * 2)
          ctx.fill()
          break

        case "bomb":
          ctx.fillStyle = "#ef4444"
          ctx.beginPath()
          ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE / 3, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = "#000"
          ctx.fillRect(x + CELL_SIZE / 2 - 2, y + 2, 4, CELL_SIZE / 3)
          break

        case "heart":
          ctx.fillStyle = "#ec4899"
          ctx.beginPath()
          ctx.moveTo(x + CELL_SIZE / 2, y + CELL_SIZE / 1.5)
          ctx.bezierCurveTo(
            x + CELL_SIZE / 2,
            y + CELL_SIZE / 3,
            x + CELL_SIZE / 4,
            y + 2,
            x + CELL_SIZE / 2,
            y + CELL_SIZE / 1.8,
          )
          ctx.bezierCurveTo(
            x + CELL_SIZE * 0.75,
            y + 2,
            x + CELL_SIZE / 2,
            y + CELL_SIZE / 3,
            x + CELL_SIZE / 2,
            y + CELL_SIZE / 1.5,
          )
          ctx.fill()
          break
      }
    })

    // Draw snake
    snake.forEach((segment, index) => {
      if (index === 0) {
        // Head - brighter blue
        ctx.fillStyle = "#3b82f6"
      } else {
        // Body - darker blue
        ctx.fillStyle = "#1e40af"
      }
      ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2)
      ctx.strokeStyle = "#60a5fa"
      ctx.lineWidth = 1
      ctx.strokeRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2)
    })

    // Draw game over overlay
    if (gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
      ctx.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE)
      ctx.fillStyle = "#fff"
      ctx.font = "bold 24px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("Game Over!", (GRID_SIZE * CELL_SIZE) / 2, (GRID_SIZE * CELL_SIZE) / 2 - 20)
      ctx.font = "18px sans-serif"
      ctx.fillText(`Final Score: ${score}`, (GRID_SIZE * CELL_SIZE) / 2, (GRID_SIZE * CELL_SIZE) / 2 + 20)
    }

    // Draw pause overlay
    if (gamePaused && !gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)"
      ctx.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE)
      ctx.fillStyle = "#fff"
      ctx.font = "bold 24px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("Paused", (GRID_SIZE * CELL_SIZE) / 2, (GRID_SIZE * CELL_SIZE) / 2)
    }
  }, [snake, items, walls, gameOver, gamePaused, score])

  // Simple audio feedback
  const playSound = (type: "food" | "bomb" | "heart" | "gameOver") => {
    // Create simple beep sounds using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    switch (type) {
      case "food":
        oscillator.frequency.value = 440
        gainNode.gain.value = 0.1
        break
      case "bomb":
        oscillator.frequency.value = 100
        gainNode.gain.value = 0.15
        oscillator.type = "sawtooth"
        break
      case "heart":
        oscillator.frequency.value = 660
        gainNode.gain.value = 0.1
        break
      case "gameOver":
        oscillator.frequency.value = 200
        gainNode.gain.value = 0.2
        oscillator.type = "square"
        break
    }

    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.1)
  }

  // Control buttons for mobile
  const handleDirectionButton = (dir: Direction) => {
    if (gameOver) return
    if (dir === "UP" && direction !== "DOWN") setNextDirection("UP")
    if (dir === "DOWN" && direction !== "UP") setNextDirection("DOWN")
    if (dir === "LEFT" && direction !== "RIGHT") setNextDirection("LEFT")
    if (dir === "RIGHT" && direction !== "LEFT") setNextDirection("RIGHT")
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Card className="p-4 bg-gray-800/50 border-gray-700 backdrop-blur">
        <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
          <div className="text-lg font-semibold">
            Score: <span className="text-blue-400">{score}</span>
          </div>
          <div className="text-lg font-semibold">
            Lives: <span className="text-pink-400">{"❤️".repeat(lives)}</span>
          </div>
          {wallsEnabled && <div className="text-sm text-yellow-400 font-semibold">⚠️ Walls Active!</div>}
          {!isMobile && (
            <Button onClick={() => setGamePaused((p) => !p)} variant="outline" size="sm" disabled={gameOver}>
              {gamePaused ? "Resume" : "Pause"}
            </Button>
          )}
        </div>

        <div
          className="relative mx-auto"
          style={{
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE,
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <canvas
            ref={canvasRef}
            width={GRID_SIZE * CELL_SIZE}
            height={GRID_SIZE * CELL_SIZE}
            className="border-2 border-gray-700 rounded"
          />
        </div>

        {isMobile && (
          <div className="mt-4 grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
            <div />
            <Button onClick={() => handleDirectionButton("UP")} variant="outline" size="lg" className="h-16 text-2xl">
              ↑
            </Button>
            <div />
            <Button onClick={() => handleDirectionButton("LEFT")} variant="outline" size="lg" className="h-16 text-2xl">
              ←
            </Button>
            <Button
              onClick={() => setGamePaused((p) => !p)}
              variant="outline"
              size="lg"
              className="h-16"
              disabled={gameOver}
            >
              {gamePaused ? "▶" : "⏸"}
            </Button>
            <Button
              onClick={() => handleDirectionButton("RIGHT")}
              variant="outline"
              size="lg"
              className="h-16 text-2xl"
            >
              →
            </Button>
            <div />
            <Button onClick={() => handleDirectionButton("DOWN")} variant="outline" size="lg" className="h-16 text-2xl">
              ↓
            </Button>
            <div />
          </div>
        )}

        <div className="mt-4 text-sm text-gray-400 text-center">
          {isMobile ? "Swipe or use buttons to control" : "Use arrow keys to control • Space to pause"}
        </div>
      </Card>

      <Card className="p-4 bg-gray-800/50 border-gray-700 backdrop-blur max-w-md">
        <h3 className="font-semibold mb-2 text-center">Items</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full" />
            <span>Food (+1)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full" />
            <span>Big Food (+3)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full" />
            <span>Bomb (damage)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-pink-500 rounded-full" />
            <span>Heart (+life, +5)</span>
          </div>
        </div>
      </Card>
    </div>
  )
}