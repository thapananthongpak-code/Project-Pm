import type { ReactNode } from 'react'
import { useTheme } from '../hooks/useTheme'
import { BuddyButton } from './Buddy'
import { CoinCounter } from './Game'
import { container } from './layout'

export type View = 'lesson' | 'wizard'

/** เมนูด้านบน: "สร้างภาพ" คือ wizard ที่เลือกหัวข้อสร้างภาพไว้แล้ว */
export type Menu = 'lesson' | 'create' | 'image'

const icon = (d: ReactNode) => (
  <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d}
  </svg>
)

const tabs: { id: Menu; label: string; short: string; icon: ReactNode }[] = [
  { id: 'lesson', label: 'เรียนรู้ RTCF', short: 'เรียนรู้', icon: icon(<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" />) },
  { id: 'create', label: 'สร้าง prompt', short: 'สร้าง', icon: icon(<path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4" />) },
  { id: 'image', label: 'สร้างภาพ', short: 'สร้างภาพ', icon: icon(<><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="9" cy="10" r="2" /><path d="M21 16l-5-5-9 9" /></>) },
]

interface Props {
  active: Menu
  onMenu: (menu: Menu) => void
}

function ThemeIcon({ dark }: { dark: boolean }) {
  return dark ? (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  )
}

export function Header({ active, onMenu }: Props) {
  const { dark, toggle } = useTheme()

  const nav = (
    <nav aria-label="เมนูหลัก" className="w-full md:w-auto">
      <ul className="grid grid-cols-3 gap-1 rounded-2xl bg-sunken p-1 md:flex">
        {tabs.map((tab) => {
          const on = active === tab.id
          return (
            <li key={tab.id}>
              <button
                type="button"
                onClick={() => onMenu(tab.id)}
                aria-current={on ? 'page' : undefined}
                aria-label={tab.label}
                className={`flex min-h-11 w-full flex-col items-center justify-center gap-0.5 rounded-xl px-2 text-xs font-semibold transition duration-200 active:scale-95 sm:flex-row sm:gap-1.5 sm:text-[15px] md:px-3 ${
                  on ? 'bg-surface text-brand-700 shadow-soft dark:text-brand-200' : 'text-muted hover:text-ink'
                }`}
              >
                <span className={on ? 'animate-pop' : ''}>{tab.icon}</span>
                <span className="whitespace-nowrap lg:hidden">{tab.short}</span>
                <span className="hidden whitespace-nowrap lg:inline">{tab.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )

  return (
    <header className="sticky top-0 z-20 bg-bg/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      {/* เส้นไล่สี RTCF ใต้หัวเว็บ */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] bg-linear-to-r from-brand-500 via-sea-500 via-45% to-mint-500 opacity-70" />
      <div className={`${container} flex flex-wrap items-center gap-2 py-2 md:flex-nowrap md:gap-3`}>
        <button
          type="button"
          onClick={() => onMenu('lesson')}
          aria-label="PromptFolio หน้าบทเรียน"
          className="mr-auto flex items-center gap-2 rounded-xl font-display text-lg font-bold md:mr-0"
        >
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="size-8 shrink-0" />
          <span aria-hidden="true" className="hidden min-[400px]:inline">
            PromptFolio
          </span>
        </button>
        <div className="order-3 w-full md:order-none md:mx-auto md:w-auto">{nav}</div>
        <CoinCounter />
        <BuddyButton />
        <button
          type="button"
          onClick={toggle}
          className="grid size-10 shrink-0 place-items-center rounded-xl text-muted hover:bg-sunken hover:text-ink"
          aria-label={dark ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
        >
          <ThemeIcon dark={dark} />
        </button>
      </div>
    </header>
  )
}
