import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { badges } from '../data'
import { badgeProgress } from '../lib/badges'
import { BadgeIcon } from './BadgeIcon'
import { CoinIcon, useGame } from './Game'

const groups = [...new Set(badges.map((b) => b.group))]

/** ชั้นวางตรารางวัล แยกหมวด ตราที่ยังไม่ได้เป็นสีเทา พร้อมแถบความคืบหน้า */
export function BadgeShelf() {
  const { game } = useGame()
  const earned = badges.filter((b) => game.badges.includes(b.id)).length

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 font-semibold">
        <span>
          สะสมแล้ว {earned}/{badges.length} ตรา
        </span>
        <span className="flex items-center gap-1 text-accent-700 dark:text-accent-300">
          <CoinIcon className="size-6" />
          {game.coins} เหรียญ
        </span>
      </div>
      <div
        className="mt-2 h-2.5 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-label="ตรารางวัลที่สะสมได้"
        aria-valuemin={0}
        aria-valuemax={badges.length}
        aria-valuenow={earned}
      >
        <div
          className="h-full rounded-full bg-linear-to-r from-brand-500 via-sea-500 to-mint-500 transition-[width] duration-700"
          style={{ width: `${(earned / badges.length) * 100}%` }}
        />
      </div>

      {groups.map((group) => (
        <section key={group} className="mt-5">
          <h3 className="text-sm font-bold text-muted">{group}</h3>
          <ul className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {badges
              .filter((b) => b.group === group)
              .map((b, i) => {
                const has = game.badges.includes(b.id)
                const p = badgeProgress(game, b.rule)
                return (
                  <li
                    key={b.id}
                    className="flex animate-fly-in flex-col items-center text-center"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <BadgeIcon
                      part={b.color}
                      icon={b.icon}
                      locked={!has}
                      className={`size-16 transition ${has ? 'hover:animate-wiggle' : ''}`}
                    />
                    <span className={`mt-1 text-sm font-semibold leading-tight ${has ? '' : 'text-muted'}`}>{b.name}</span>
                    <span className="text-xs leading-snug text-muted">{b.desc}</span>
                    {!has && p && p.goal > 1 && (
                      <span className="mt-1 w-full">
                        <span className="block h-1.5 overflow-hidden rounded-full bg-line">
                          <span
                            className="block h-full rounded-full bg-sea-500"
                            style={{ width: `${Math.min(p.value / p.goal, 1) * 100}%` }}
                          />
                        </span>
                        <span className="text-[11px] font-semibold text-muted">
                          {Math.min(p.value, p.goal)}/{p.goal}
                        </span>
                      </span>
                    )}
                    <span className="sr-only">{has ? 'ได้แล้ว' : 'ยังไม่ได้'}</span>
                  </li>
                )
              })}
          </ul>
        </section>
      ))}
    </div>
  )
}

/** ปุ่มตรารางวัลบนหัวเว็บ กดดูชั้นวางตราได้ตลอด */
export function BadgesButton() {
  const { game } = useGame()
  const [open, setOpen] = useState(false)
  const count = game.badges.length
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`ตรารางวัลของฉัน (${count}/${badges.length})`}
        title="ตรารางวัลของฉัน"
        className="relative grid size-11 shrink-0 place-items-center rounded-2xl bg-sunken transition hover:-translate-y-0.5 active:scale-95"
      >
        <BadgeIcon part="R" icon="trophy" className="size-9" />
        <span
          key={count}
          className="absolute -right-1 -top-1 grid min-w-5 animate-bounce-in place-items-center rounded-full bg-accent-500 px-1 text-[11px] font-bold text-white shadow-soft"
        >
          {count}
        </span>
      </button>
      {open && <BadgesDialog onClose={() => setOpen(false)} />}
    </>
  )
}

function BadgesDialog({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // วางที่ body: หัวเว็บมี backdrop-blur ทำให้ position: fixed ข้างในไม่เต็มจอ
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="badges-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-ink/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="card deco-card w-full max-w-4xl animate-bounce-in p-5 sm:p-7" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between gap-3">
            <h2 id="badges-title" className="text-2xl font-bold">
              ตรารางวัลของฉัน
            </h2>
            <button ref={closeRef} type="button" onClick={onClose} className="btn-ghost min-h-10 px-4 text-sm">
              ปิด
            </button>
          </div>
          <div className="mt-4">
            <BadgeShelf />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
