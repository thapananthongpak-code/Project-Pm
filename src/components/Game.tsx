import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { badges } from '../data'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { celebrate } from '../lib/confetti'
import { applyAward, emptyGame, reviveGame, type Award, type GameState } from '../lib/game'
import { BadgeIcon } from './BadgeIcon'

interface GameApi {
  game: GameState
  /** ให้ดาว/เหรียญ ครั้งเดียวต่อ key */
  award: (award: Award) => void
  reset: () => void
  /** ดาวที่เพิ่งได้ล่าสุด ใช้ทำแอนิเมชัน +N */
  lastGain: { id: number; amount: number } | null
}

const GameContext = createContext<GameApi | null>(null)

export function useGame() {
  const api = useContext(GameContext)
  if (!api) throw new Error('useGame ต้องอยู่ใน GameProvider')
  return api
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useLocalStorage<GameState>('promptfolio:game:v1', emptyGame, reviveGame)
  const [lastGain, setLastGain] = useState<GameApi['lastGain']>(null)
  const [newBadge, setNewBadge] = useState<string | null>(null)
  // อ่าน state ล่าสุดได้ทันที ไม่ต้องรอ render (กันให้รางวัลซ้ำเมื่อเรียกติดกัน)
  const latest = useRef(game)
  latest.current = game

  const award = useCallback(
    (a: Award) => {
      const prev = latest.current
      const next = applyAward(prev, a)
      if (next === prev) return
      latest.current = next
      setGame(next)
      if (a.stars) setLastGain({ id: Date.now(), amount: a.stars })
      if (a.badge && !prev.badges.includes(a.badge)) setNewBadge(a.badge)
    },
    [setGame],
  )

  const reset = useCallback(() => setGame(emptyGame), [setGame])

  return (
    <GameContext.Provider value={{ game, award, reset, lastGain }}>
      {children}
      {newBadge && <BadgePopup id={newBadge} onClose={() => setNewBadge(null)} />}
    </GameContext.Provider>
  )
}

function BadgePopup({ id, onClose }: { id: string; onClose: () => void }) {
  const badge = badges.find((b) => b.id === id)
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
        <BadgeIcon part={badge.color} className="mx-auto mt-3 size-24 animate-wiggle" />
        <h2 id="badge-title" className="mt-3 text-2xl font-bold">
          {badge.name}
        </h2>
        <p className="text-muted">{badge.desc}</p>
        <button ref={closeRef} type="button" onClick={onClose} className="btn-primary mt-5 w-full">
          เยี่ยมเลย
        </button>
      </div>
    </div>
  )
}

/** ตัวนับดาวบนหัวเว็บ เด้งและมี +N ลอยขึ้นเมื่อได้ดาว */
export function StarCounter() {
  const { game, lastGain } = useGame()
  return (
    <div className="relative" aria-live="polite">
      <div
        key={lastGain?.id}
        className={`flex h-10 items-center gap-1.5 rounded-2xl bg-linear-to-r from-[#ffd23f] to-accent-300 px-3 font-bold text-[#3b2400] shadow-soft ${
          lastGain ? 'animate-bounce-in' : ''
        }`}
        title="ดาวที่สะสมได้"
      >
        <StarIcon className="size-5" />
        <span className="tabular-nums">{game.stars}</span>
        <span className="sr-only">ดาว</span>
      </div>
      {lastGain && (
        <span
          key={`gain-${lastGain.id}`}
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-6 right-1 animate-rise font-bold text-accent-600"
        >
          +{lastGain.amount}
        </span>
      )}
    </div>
  )
}

export function StarIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}
