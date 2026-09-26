import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { buddies, buddyLines, shopItems, type BuddyInfo, type BuddyLines } from '../data'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { buddyItemId, type Equipped } from '../lib/game'
import { celebrate } from '../lib/confetti'
import { BuddyArt, type BuddyAction } from './BuddyArt'
import { useGame } from './Game'

export type { BuddyAction } from './BuddyArt'

interface BuddyApi {
  buddy: BuddyInfo
  choose: (id: string) => void
  openPicker: () => void
}

const BuddyContext = createContext<BuddyApi | null>(null)

export function useBuddy() {
  const api = useContext(BuddyContext)
  if (!api) throw new Error('useBuddy ต้องอยู่ใน BuddyProvider')
  return api
}

const pickOne = <T,>(list: T[], avoid?: T): T => {
  const pool = list.length > 1 ? list.filter((x) => x !== avoid) : list
  return pool[Math.floor(Math.random() * pool.length)]
}

/** สุ่มข้อความจากหมวด */
export function randomLine(kind: keyof BuddyLines, avoid?: string): string {
  return pickOne(buddyLines[kind], avoid) ?? buddyLines[kind][0]
}

export function BuddyProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useLocalStorage<string>('promptfolio:buddy:v1', '', (raw) =>
    typeof raw === 'string' && buddies.some((b) => b.id === raw) ? raw : '',
  )
  const [picking, setPicking] = useState(false)
  const { game } = useGame()
  // ตัวละครพิเศษต้องปลดล็อกก่อน (เช่น ล้างข้อมูลแล้ว) ไม่อย่างนั้นใช้ตัวแรก
  const buddy =
    buddies.find((b) => b.id === id && (!b.special || game.owned.includes(buddyItemId(b.id)))) ?? buddies[0]

  const choose = useCallback(
    (next: string) => {
      setId(next)
      setPicking(false)
    },
    [setId],
  )

  return (
    <BuddyContext.Provider value={{ buddy, choose, openPicker: () => setPicking(true) }}>
      {children}
      {(picking || id === '') && (
        <BuddyPicker current={id || buddies[0].id} canClose={id !== ''} onChoose={choose} onClose={() => setPicking(false)} />
      )}
    </BuddyContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// การขยับ

/** ท่าตามสถานการณ์ที่เล่นครั้งเดียวแล้วกลับไปท่าปกติ */
const EVENTS: BuddyAction[] = ['wave', 'cheer', 'oops', 'love']
const EVENT_MS = 2800
const MOVE_MS: Partial<Record<BuddyAction, number>> = { sleep: 4500, dance: 2600, tailwag: 2200, earflop: 2100, scan: 2000 }

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mq) return
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

interface Motion {
  action: BuddyAction
  /** เปลี่ยนทุกครั้งที่เริ่มท่าใหม่ ใช้เป็น key ให้แอนิเมชันเล่นใหม่ */
  n: number
  chatter?: string
}

/**
 * ท่าทางของผู้ช่วย: เล่นท่าตามสถานการณ์ (base) แล้ว ถ้า lively จะขยับเองตามนิสัยเป็นระยะ
 * ไม่ถี่เกินไป หยุดเมื่อแท็บถูกซ่อน และปิดเมื่อผู้ใช้ตั้งค่าลดการเคลื่อนไหว
 */
export function useBuddyMotion(buddy: BuddyInfo, base: BuddyAction, lively: boolean) {
  const [m, setM] = useState<Motion>({ action: base, n: 0 })
  const back = useRef<number | undefined>(undefined)
  const reduced = usePrefersReducedMotion()
  // ท่าที่จะกลับไปหลังเล่นจบ: ท่าค้าง (เช่น think) หรือท่าปกติ
  const rest: BuddyAction = EVENTS.includes(base) ? 'idle' : base

  const play = useCallback(
    (action: BuddyAction, ms?: number, chatter?: string) => {
      window.clearTimeout(back.current)
      setM((s) => ({ action, n: s.n + 1, chatter }))
      back.current = window.setTimeout(
        () => setM((s) => ({ action: rest, n: s.n + 1 })),
        ms ?? (EVENTS.includes(action) ? EVENT_MS : (MOVE_MS[action] ?? 1900)),
      )
    },
    [rest],
  )

  // สถานการณ์เปลี่ยน: เล่นท่านั้น
  useEffect(() => {
    if (EVENTS.includes(base)) play(base)
    else {
      window.clearTimeout(back.current)
      setM((s) => ({ action: base, n: s.n + 1 }))
    }
  }, [base, play])

  useEffect(() => () => window.clearTimeout(back.current), [])

  // ว่างอยู่: สุ่มขยับตามนิสัย
  useEffect(() => {
    if (!lively || reduced || m.action !== 'idle') return
    const [min, max] = buddy.tempo
    const t = window.setTimeout(
      () => {
        if (document.hidden) return setM((s) => ({ ...s, n: s.n + 1 })) // แท็บถูกซ่อน: รอรอบหน้า
        const chatter = Math.random() < 0.35 ? pickOne(buddy.chatter) : undefined
        play(pickOne(buddy.moves), undefined, chatter)
      },
      (min + Math.random() * (max - min)) * 1000,
    )
    return () => window.clearTimeout(t)
  }, [lively, reduced, m.action, m.n, buddy, play])

  return { ...m, play }
}

interface LivelyProps {
  action?: BuddyAction
  /** ขยับเองเป็นระยะตามนิสัย */
  lively?: boolean
  /** กดแล้วทำอะไรเพิ่ม (เช่น บอกทริค) */
  onTap?: () => void
  /** เพิ่มค่าเมื่ออยากให้พยักหน้าตอบ (เช่น ตอนนักเรียนพิมพ์) */
  pulse?: number
  buddy?: BuddyInfo
  /** ของแต่งตัว (ไม่ใส่ = ใช้ของที่ใส่อยู่) เช่น ร้านค้าใช้ลองใส่ */
  outfit?: Equipped
  className?: string
  label?: string
}

/** ผู้ช่วยที่มีชีวิต: ขยับเอง พึมพำ แตะแล้วตอบสนองตามนิสัย พร้อมเวทีแสงด้านหลัง */
export function LivelyBuddy({ action = 'idle', lively = true, onTap, pulse, buddy: own, outfit, className = '', label }: LivelyProps) {
  const { buddy: current } = useBuddy()
  const { game, award } = useGame()
  const buddy = own ?? current
  const motion = useBuddyMotion(buddy, action, lively)
  const lastNod = useRef(0)
  const { play } = motion

  // นักเรียนพิมพ์: พยักหน้าเบาๆ (ไม่เกินทุก 5 วินาที)
  useEffect(() => {
    if (!pulse || motion.action !== 'idle') return
    const now = Date.now()
    if (now - lastNod.current < 5000) return
    lastNod.current = now
    play('nod')
  }, [pulse]) // ตอบสนองเฉพาะตอน pulse เปลี่ยน

  const art = (
    <span className="relative isolate inline-block">
      {/* เวทีแสงหลังตัวละคร */}
      <span
        aria-hidden="true"
        className="absolute inset-x-[8%] bottom-[2%] top-[20%] -z-10 rounded-full opacity-45 blur-md"
        style={{ background: `radial-gradient(circle at 50% 60%, ${buddy.color}, transparent 70%)` }}
      />
      <BuddyArt
        key={`${buddy.id}-${motion.n}`}
        buddy={buddy}
        action={motion.action}
        outfit={outfit ?? game.equipped}
        className={className}
      />
      {motion.chatter && (
        <span
          key={`c-${motion.n}`}
          aria-hidden="true"
          className="pointer-events-none absolute -top-3 left-0 z-10 w-max max-w-44 animate-bounce-in rounded-2xl border border-line bg-surface px-2.5 py-1 text-xs font-semibold shadow-soft"
        >
          {motion.chatter} {buddy.ending}
        </span>
      )}
    </span>
  )

  if (!onTap && !label) return art
  return (
    <button
      type="button"
      onClick={() => {
        play(pickOne(buddy.tap))
        award({ count: 'taps' })
        onTap?.()
      }}
      aria-label={label ?? `แตะผู้ช่วย (${buddy.intro})`}
      className="shrink-0 rounded-full transition active:scale-95"
    >
      {art}
    </button>
  )
}

/** ผู้ช่วยแบบนิ่ง (ท่าเดียว ไม่ขยับเอง) เช่น ภาพประกอบในบทเรียน */
export function Buddy({ action = 'idle', className = '' }: { action?: BuddyAction; className?: string }) {
  const { buddy } = useBuddy()
  const { game } = useGame()
  return <BuddyArt key={`${buddy.id}-${action}`} buddy={buddy} action={action} outfit={game.equipped} className={className} />
}

interface TipProps {
  /** ท่าทางตามสถานการณ์ */
  action?: BuddyAction
  /** ข้อความให้กำลังใจ (ตัวหนา มีคำลงท้ายของผู้ช่วย) */
  lead?: string
  children?: ReactNode
  size?: 'md' | 'lg'
  /** เพิ่มค่าเมื่อนักเรียนพิมพ์ ผู้ช่วยจะพยักหน้า */
  pulse?: number
  className?: string
}

/**
 * ผู้ช่วยพร้อมกล่องคำพูด ขยับเองตามนิสัย และแตะที่ผู้ช่วยเพื่อฟังทริคใหม่
 */
export function BuddyTip({ action = 'idle', lead, children, size = 'md', pulse, className = '' }: TipProps) {
  const { buddy } = useBuddy()
  const [tip, setTip] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])
  // สถานการณ์เปลี่ยน กลับไปแสดงข้อความของหน้านั้น
  useEffect(() => setTip(null), [action, lead])

  function showTip() {
    window.clearTimeout(timer.current)
    setTip((prev) => randomLine('tips', prev ?? undefined))
    timer.current = window.setTimeout(() => setTip(null), 7000)
  }

  const art = size === 'lg' ? 'size-28 sm:size-36' : 'size-20 sm:size-24'

  return (
    <div className={`flex items-end gap-3 ${className}`}>
      <LivelyBuddy action={action} onTap={showTip} pulse={pulse} className={art} label={`แตะผู้ช่วยเพื่อฟังทริค`} />
      <div
        role="status"
        aria-live="polite"
        key={tip ?? `${action}-${lead}`}
        className="bubble relative mb-3 min-w-0 flex-1 animate-bounce-in rounded-2xl border border-line bg-surface px-4 py-3 text-[15px] shadow-soft"
      >
        {tip ? (
          <>
            <span className="font-semibold text-brand-700 dark:text-brand-300">ทริค: </span>
            {tip} {buddy.ending}
          </>
        ) : (
          <>
            {lead && (
              <span className="block font-semibold">
                {lead} {buddy.ending}
              </span>
            )}
            {children}
          </>
        )}
      </div>
    </div>
  )
}

/** ปุ่มรูปผู้ช่วยบนหัวเว็บ กดเพื่อเปลี่ยนผู้ช่วย */
export function BuddyButton() {
  const { buddy, openPicker } = useBuddy()
  return (
    <button
      type="button"
      onClick={openPicker}
      aria-label={`เปลี่ยนผู้ช่วย (ตอนนี้: ${buddy.intro})`}
      title="เปลี่ยนผู้ช่วย"
      className="grid size-11 shrink-0 place-items-center rounded-2xl bg-sunken transition hover:-translate-y-0.5 active:scale-95"
    >
      <Buddy className="size-10" />
    </button>
  )
}

function BuddyPicker({
  current,
  canClose,
  onChoose,
  onClose,
}: {
  current: string
  canClose: boolean
  onChoose: (id: string) => void
  onClose: () => void
}) {
  const [selected, setSelected] = useState(current)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const { game, buy } = useGame()
  const pick = buddies.find((b) => b.id === selected) ?? buddies[0]
  const normal = buddies.filter((b) => !b.special)
  const specials = buddies.filter((b) => b.special)
  const owns = (b: BuddyInfo) => !b.special || game.owned.includes(buddyItemId(b.id))
  const pickLocked = !owns(pick)
  const short = (pick.price ?? 0) - game.coins

  function confirm() {
    if (pickLocked) {
      const item = shopItems.find((i) => i.id === buddyItemId(pick.id))
      if (!item || !buy(item)) return
      celebrate('big')
    }
    onChoose(pick.id)
  }

  useEffect(() => {
    confirmRef.current?.focus()
    if (!canClose) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [canClose, onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="picker-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-ink/55"
      onClick={canClose ? onClose : undefined}
    >
      {/* min-h-full + items-center: อยู่กลางจอถ้าพอดี และเลื่อนดูได้ถ้าจอเตี้ย (ไม่ถูกตัดด้านบน) */}
      <div className="flex min-h-full items-center justify-center p-4">
      <div className="card deco-card w-full max-w-3xl animate-bounce-in p-5 sm:p-7" onClick={(e) => e.stopPropagation()}>
        <h2 id="picker-title" className="text-center text-2xl font-bold sm:text-3xl">
          เลือกผู้ช่วยของเธอ
        </h2>
        <p className="text-center text-muted">ผู้ช่วยจะคอยเล่นด้วย ให้กำลังใจ และบอกทริค เปลี่ยนได้ทุกเมื่อ</p>

        <div role="radiogroup" aria-labelledby="picker-title">
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {normal.map((b, i) => (
              <PickCard key={b.id} buddy={b} on={b.id === selected} index={i} wide={i === normal.length - 1} onPick={setSelected} />
            ))}
          </div>
          <p className="mt-5 flex items-center gap-2 font-semibold">
            <span className="rounded-full bg-linear-to-r from-[#ffd23f] to-accent-300 px-3 py-0.5 text-xs font-bold text-[#3b2400]">พิเศษ</span>
            ตัวละครพิเศษ ปลดล็อกด้วยเหรียญ
          </p>
          <div className="mt-2 grid grid-cols-3 gap-3">
            {specials.map((b, i) => (
              <PickCard
                key={b.id}
                buddy={b}
                on={b.id === selected}
                index={normal.length + i}
                locked={!owns(b)}
                onPick={setSelected}
              />
            ))}
          </div>
        </div>

        <p key={pick.id} className="mt-4 animate-fly-in text-center text-muted" aria-live="polite">
          {pick.intro} · <span className="font-semibold text-ink">“มาเป็นทีมเดียวกันนะ {pick.ending}”</span>
        </p>
        <div className="mt-4 flex gap-2">
          {canClose && (
            <button type="button" onClick={onClose} className="btn-ghost">
              ยกเลิก
            </button>
          )}
          <button
            ref={confirmRef}
            type="button"
            onClick={confirm}
            disabled={pickLocked && short > 0}
            className={`${pickLocked ? 'btn-accent' : 'btn-primary'} flex-1 text-lg`}
          >
            {!pickLocked
              ? 'เลือกผู้ช่วยตัวนี้'
              : short > 0
                ? `ต้องใช้ ${pick.price} เหรียญ (ขาดอีก ${short})`
                : `ปลดล็อก ${pick.price} เหรียญ แล้วใช้เลย`}
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}

/** การ์ดตัวเลือกผู้ช่วยในหน้าต่างเลือก */
function PickCard({
  buddy: b,
  on,
  index,
  wide = false,
  locked = false,
  onPick,
}: {
  buddy: BuddyInfo
  on: boolean
  index: number
  wide?: boolean
  locked?: boolean
  onPick: (id: string) => void
}) {
  const { game } = useGame()
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      aria-label={locked ? `${b.intro} (ล็อกอยู่ ${b.price} เหรียญ)` : b.intro}
      onClick={() => onPick(b.id)}
      style={{ animationDelay: `${index * 70}ms` }}
      className={`relative flex animate-fly-in flex-col items-center justify-center gap-1 rounded-3xl border-2 p-3 pt-5 text-center transition duration-200 hover:-translate-y-1 active:scale-95 ${
        on ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/40' : 'border-line bg-surface'
      } ${wide ? 'col-span-2 sm:col-span-1' : ''}`}
    >
      {locked && (
        <span className="absolute right-2 top-2 flex items-center gap-0.5 rounded-full bg-ink/80 px-2 py-0.5 text-[11px] font-bold text-white">
          <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true">
            <path d="M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3" />
          </svg>
          {b.price}
        </span>
      )}
      {on ? (
        <LivelyBuddy buddy={b} action="wave" className="size-20 sm:size-28" />
      ) : (
        <BuddyArt buddy={b} action="idle" outfit={game.equipped} className={`size-20 sm:size-28 ${locked ? 'opacity-80 saturate-50' : ''}`} />
      )}
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${on ? 'bg-brand-600 text-white' : 'bg-sunken text-muted'}`}>
        {b.trait}
      </span>
    </button>
  )
}
