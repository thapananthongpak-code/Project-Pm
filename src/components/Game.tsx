import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { badges } from '../data'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { celebrate } from '../lib/confetti'
import { applyBadge, emptyGame, reviveGame, type GameState } from '../lib/game'
import { BadgeIcon } from './BadgeIcon'
import { Buddy, useBuddy } from './Buddy'

interface GameApi {
  game: GameState
  /** ให้เหรียญ (ได้ครั้งเดียว) */
  award: (badge: string) => void
  reset: () => void
}

const GameContext = createContext<GameApi | null>(null)

export function useGame() {
  const api = useContext(GameContext)
  if (!api) throw new Error('useGame ต้องอยู่ใน GameProvider')
  return api
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useLocalStorage<GameState>('promptfolio:game:v1', emptyGame, reviveGame)
  const [newBadge, setNewBadge] = useState<string | null>(null)
  // อ่าน state ล่าสุดได้ทันที ไม่ต้องรอ render (กันให้เหรียญซ้ำเมื่อเรียกติดกัน)
  const latest = useRef(game)
  latest.current = game

  const award = useCallback(
    (badge: string) => {
      const next = applyBadge(latest.current, badge)
      if (next === latest.current) return
      latest.current = next
      setGame(next)
      setNewBadge(badge)
    },
    [setGame],
  )

  const reset = useCallback(() => setGame(emptyGame), [setGame])

  return (
    <GameContext.Provider value={{ game, award, reset }}>
      {children}
      {newBadge && <BadgePopup id={newBadge} onClose={() => setNewBadge(null)} />}
    </GameContext.Provider>
  )
}

function BadgePopup({ id, onClose }: { id: string; onClose: () => void }) {
  const badge = badges.find((b) => b.id === id)
  const { buddy } = useBuddy()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    celebrate('small')
    closeRef.current?.focus()
    const t = window.setTimeout(onClose, 4500)
    return () => window.clearTimeout(t)
  }, [onClose])

  if (!badge) return null
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="badge-title"
      className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="card w-full max-w-sm animate-bounce-in p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <p className="text-sm font-semibold text-muted">ได้เหรียญใหม่!</p>
        <div className="mt-3 flex items-end justify-center gap-2">
          <Buddy action="cheer" className="size-24" />
          <BadgeIcon part={badge.color} className="size-24 animate-wiggle" />
        </div>
        <h2 id="badge-title" className="mt-3 text-2xl font-bold">
          {badge.name}
        </h2>
        <p className="text-muted">
          {badge.desc} · {buddy.name}ดีใจด้วย {buddy.ending}
        </p>
        <button ref={closeRef} type="button" onClick={onClose} className="btn-primary mt-5 w-full">
          เยี่ยมเลย
        </button>
      </div>
    </div>
  )
}
