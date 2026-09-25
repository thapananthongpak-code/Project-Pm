import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { buddies, buddyLines, type BuddyInfo, type BuddyLines } from '../data'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { BuddyArt, type BuddyAction } from './BuddyArt'

export type { BuddyAction } from './BuddyArt'

interface BuddyApi {
  buddy: BuddyInfo
  /** เลือกแล้วหรือยัง (ครั้งแรกยังไม่เลือก จะเปิดหน้าต่างให้เลือก) */
  chosen: boolean
  choose: (id: string) => void
  openPicker: () => void
}

const BuddyContext = createContext<BuddyApi | null>(null)

export function useBuddy() {
  const api = useContext(BuddyContext)
  if (!api) throw new Error('useBuddy ต้องอยู่ใน BuddyProvider')
  return api
}

/** สุ่มข้อความจากหมวด */
export function randomLine(kind: keyof BuddyLines, avoid?: string): string {
  const pool = buddyLines[kind].filter((l) => l !== avoid)
  return pool[Math.floor(Math.random() * pool.length)] ?? buddyLines[kind][0]
}

export function BuddyProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useLocalStorage<string>('promptfolio:buddy:v1', '', (raw) =>
    typeof raw === 'string' && buddies.some((b) => b.id === raw) ? raw : '',
  )
  const [picking, setPicking] = useState(false)
  const buddy = buddies.find((b) => b.id === id) ?? buddies[0]

  const choose = useCallback(
    (next: string) => {
      setId(next)
      setPicking(false)
    },
    [setId],
  )

  return (
    <BuddyContext.Provider value={{ buddy, chosen: id !== '', choose, openPicker: () => setPicking(true) }}>
      {children}
      {(picking || id === '') && (
        <BuddyPicker current={id || buddies[0].id} canClose={id !== ''} onChoose={choose} onClose={() => setPicking(false)} />
      )}
    </BuddyContext.Provider>
  )
}

/** ผู้ช่วยที่เลือกไว้ */
export function Buddy({ action = 'idle', className = '' }: { action?: BuddyAction; className?: string }) {
  const { buddy } = useBuddy()
  // key: เปลี่ยนท่าแล้วให้แอนิเมชันเริ่มใหม่
  return <BuddyArt key={`${buddy.id}-${action}`} buddy={buddy} action={action} className={className} />
}

const tapActions: BuddyAction[] = ['wave', 'cheer', 'love']

interface TipProps {
  /** ท่าทางตามสถานการณ์ */
  action?: BuddyAction
  /** ข้อความให้กำลังใจ (ตัวหนา มีคำลงท้ายของผู้ช่วย) */
  lead?: string
  children?: ReactNode
  size?: 'md' | 'lg'
  className?: string
}

/**
 * ผู้ช่วยพร้อมกล่องคำพูด แตะที่ผู้ช่วยเพื่อฟังทริคใหม่ (ขยับท่าน่ารักด้วย)
 */
export function BuddyTip({ action = 'idle', lead, children, size = 'md', className = '' }: TipProps) {
  const { buddy } = useBuddy()
  const [tapped, setTapped] = useState<{ action: BuddyAction; tip: string } | null>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])
  // สถานการณ์เปลี่ยน กลับไปแสดงข้อความของหน้านั้น
  useEffect(() => setTapped(null), [action, lead])

  function tap() {
    window.clearTimeout(timer.current)
    setTapped((prev) => ({
      action: tapActions[Math.floor(Math.random() * tapActions.length)],
      tip: randomLine('tips', prev?.tip),
    }))
    timer.current = window.setTimeout(() => setTapped(null), 6000)
  }

  const art = size === 'lg' ? 'size-28 sm:size-36' : 'size-20 sm:size-24'

  return (
    <div className={`flex items-end gap-2 ${className}`}>
      <button
        type="button"
        onClick={tap}
        aria-label={`แตะ${buddy.name}เพื่อฟังทริค`}
        className="shrink-0 rounded-full transition active:scale-95"
      >
        <Buddy action={tapped?.action ?? action} className={art} />
      </button>
      <div
        role="status"
        aria-live="polite"
        key={tapped?.tip ?? `${action}-${lead}`}
        className="relative mb-3 min-w-0 flex-1 animate-bounce-in rounded-2xl rounded-bl-sm border border-line bg-surface px-4 py-3 text-[15px] shadow-soft"
      >
        <span className="block text-xs font-bold text-brand-700 dark:text-brand-300">{buddy.name}</span>
        {tapped ? (
          <>
            <span className="font-semibold">ทริค: </span>
            {tapped.tip} {buddy.ending}
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
      aria-label={`เปลี่ยนผู้ช่วย (ตอนนี้: ${buddy.name})`}
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
  const pick = buddies.find((b) => b.id === selected) ?? buddies[0]

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
      className="fixed inset-0 z-50 grid place-items-center overflow-auto bg-ink/40 p-4 backdrop-blur-sm"
      onClick={canClose ? onClose : undefined}
    >
      <div className="card w-full max-w-3xl animate-bounce-in p-5 sm:p-7" onClick={(e) => e.stopPropagation()}>
        <h2 id="picker-title" className="text-center text-2xl font-bold sm:text-3xl">
          เลือกผู้ช่วยของเธอ
        </h2>
        <p className="text-center text-muted">ผู้ช่วยจะคอยให้กำลังใจและบอกทริคตลอดภารกิจ เปลี่ยนได้ทุกเมื่อ</p>

        <div role="radiogroup" aria-labelledby="picker-title" className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {buddies.map((b, i) => {
            const on = b.id === selected
            return (
              <button
                key={b.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setSelected(b.id)}
                style={{ animationDelay: `${i * 80}ms` }}
                className={`flex animate-fly-in flex-col items-center rounded-3xl border-2 p-3 text-center transition duration-200 hover:-translate-y-1 active:scale-95 ${
                  on ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/40' : 'border-line bg-surface'
                } ${i === buddies.length - 1 ? 'col-span-2 sm:col-span-1' : ''}`}
              >
                <BuddyArt key={`${b.id}-${on}`} buddy={b} action={on ? 'wave' : 'idle'} className="size-24" />
                <span className="mt-1 font-display font-bold">{b.name}</span>
                <span className="text-xs text-muted">{b.intro}</span>
              </button>
            )
          })}
        </div>

        <p key={pick.id} className="mt-4 animate-fly-in text-center font-semibold" aria-live="polite">
          “สวัสดี! เรา{pick.name} มาเป็นทีมเดียวกันนะ {pick.ending}”
        </p>
        <div className="mt-4 flex gap-2">
          {canClose && (
            <button type="button" onClick={onClose} className="btn-ghost">
              ยกเลิก
            </button>
          )}
          <button ref={confirmRef} type="button" onClick={() => onChoose(selected)} className="btn-primary flex-1 text-lg">
            เลือก{pick.name}
          </button>
        </div>
      </div>
    </div>
  )
}
