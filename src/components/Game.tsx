import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { badges } from '../data'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { newlyEarned } from '../lib/badges'
import { celebrate } from '../lib/confetti'
import { applyAward, buyItem, emptyGame, equipItem, reviveGame, type Award, type GameState, type ShopItem, type Slot } from '../lib/game'
import { BadgeIcon } from './BadgeIcon'
import { Buddy, useBuddy } from './Buddy'

interface GameApi {
  game: GameState
  /** ให้เหรียญ/ตรารางวัล (มี key = ครั้งเดียว) */
  award: (award: Award) => void
  /** ซื้อของ คืน true ถ้าซื้อสำเร็จ */
  buy: (item: ShopItem) => boolean
  /** ใส่/ถอดของที่มีแล้ว */
  equip: (slot: Slot, id: string | null) => void
  reset: () => void
  /** เหรียญที่เพิ่งได้/ใช้ล่าสุด ใช้ทำแอนิเมชัน +N / -N */
  lastGain: { id: number; amount: number } | null
  /** ตรารางวัลที่เพิ่งได้ (แสดงป๊อปอัป) */
  newBadge: string | null
  clearBadge: () => void
}

const GameContext = createContext<GameApi | null>(null)

export function useGame() {
  const api = useContext(GameContext)
  if (!api) throw new Error('useGame ต้องอยู่ใน GameProvider')
  return api
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useLocalStorage<GameState>('promptfolio:game:v1', emptyGame, reviveGame)
  // ตรารางวัลใหม่รอแสดง (ได้หลายอันพร้อมกันจะเด้งทีละอัน)
  const [queue, setQueue] = useState<string[]>([])
  const [lastGain, setLastGain] = useState<GameApi['lastGain']>(null)
  // อ่าน state ล่าสุดได้ทันที ไม่ต้องรอ render (กันให้รางวัลซ้ำเมื่อเรียกติดกัน)
  const latest = useRef(game)
  latest.current = game

  /** บันทึก state ใหม่ และให้ตราที่ปลดล็อกจากตัวนับ/ของที่มี */
  const commit = useCallback(
    (next: GameState, eventBadges: string[] = []) => {
      const auto = newlyEarned(next, badges)
      const final = auto.length ? { ...next, badges: [...next.badges, ...auto] } : next
      latest.current = final
      setGame(final)
      const fresh = [...eventBadges, ...auto]
      if (fresh.length) setQueue((q) => [...q, ...fresh])
    },
    [setGame],
  )

  // ผู้ใช้เดิมที่ทำเงื่อนไขครบแล้ว (ก่อนมีตราใหม่) ได้ตราตอนเปิดเว็บ
  useEffect(() => {
    if (newlyEarned(latest.current, badges).length) commit(latest.current)
  }, [commit])

  const award = useCallback(
    (a: Award) => {
      const prev = latest.current
      const next = applyAward(prev, a)
      if (next === prev) return
      if (a.coins) setLastGain({ id: Date.now(), amount: a.coins })
      commit(next, a.badge && !prev.badges.includes(a.badge) ? [a.badge] : [])
    },
    [commit],
  )

  const buy = useCallback(
    (item: ShopItem) => {
      const prev = latest.current
      const next = buyItem(prev, item)
      if (next === prev) return false
      setLastGain({ id: Date.now(), amount: -item.price })
      commit(next)
      return true
    },
    [commit],
  )

  const equip = useCallback(
    (slot: Slot, id: string | null) => commit(equipItem(latest.current, slot, id)),
    [commit],
  )

  const reset = useCallback(() => {
    latest.current = emptyGame
    setGame(emptyGame)
    setQueue([])
  }, [setGame])
  const clearBadge = useCallback(() => setQueue((q) => q.slice(1)), [])

  return (
    <GameContext.Provider value={{ game, award, buy, equip, reset, lastGain, newBadge: queue[0] ?? null, clearBadge }}>
      {children}
    </GameContext.Provider>
  )
}

/** ป๊อปอัปตรารางวัลใหม่ (วางไว้ใน App ใต้ BuddyProvider เพื่อให้ผู้ช่วยแต่งตัวตามของที่ใส่) */
export function BadgePopupHost() {
  const { newBadge, clearBadge } = useGame()
  return newBadge ? <BadgePopup key={newBadge} id={newBadge} onClose={clearBadge} /> : null
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
      className="fixed inset-0 z-50 grid place-items-center bg-ink/55 p-6"
      onClick={onClose}
    >
      <div className="card w-full max-w-sm animate-bounce-in p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <p className="text-sm font-semibold text-muted">ได้ตรารางวัลใหม่!</p>
        <div className="mt-3 flex items-end justify-center gap-2">
          <Buddy action="cheer" className="size-24" />
          <BadgeIcon part={badge.color} icon={badge.icon} className="size-24 animate-wiggle" />
        </div>
        <h2 id="badge-title" className="mt-3 text-2xl font-bold">
          {badge.name}
        </h2>
        <p className="text-muted">
          {badge.desc} · ผู้ช่วยดีใจด้วย {buddy.ending}
        </p>
        <button ref={closeRef} type="button" onClick={onClose} className="btn-primary mt-5 w-full">
          เยี่ยมเลย
        </button>
      </div>
    </div>
  )
}

/** ตัวนับเหรียญบนหัวเว็บ เด้งและมี +N ลอยขึ้นเมื่อได้เหรียญ กดแล้วไปร้านค้า */
export function CoinCounter({ onClick }: { onClick?: () => void }) {
  const { game, lastGain } = useGame()
  return (
    <button type="button" onClick={onClick} aria-label={`${game.coins} เหรียญ เปิดร้านค้า`} className="relative rounded-2xl active:scale-95">
      <div
        key={lastGain?.id}
        className={`flex h-10 items-center gap-1.5 rounded-2xl bg-linear-to-r from-[#ffd23f] to-accent-300 px-3 font-bold text-[#3b2400] shadow-soft ${
          lastGain ? 'animate-bounce-in' : ''
        }`}
        title="เหรียญที่สะสมได้"
      >
        <CoinIcon className="size-6" />
        <span className="tabular-nums">{game.coins}</span>
        <span className="sr-only">เหรียญ</span>
      </div>
      {lastGain && (
        <span
          key={`gain-${lastGain.id}`}
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-6 right-1 animate-rise font-bold text-accent-600"
        >
          {lastGain.amount > 0 ? `+${lastGain.amount}` : lastGain.amount}
        </span>
      )}
    </button>
  )
}

export function CoinIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#ffc21a" stroke="#c98a00" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="6.8" fill="none" stroke="#fff3c4" strokeWidth="1.3" />
      <path d="M12 8.2l1.2 2.5 2.7.3-2 1.9.5 2.7-2.4-1.3-2.4 1.3.5-2.7-2-1.9 2.7-.3z" fill="#fff3c4" />
    </svg>
  )
}
