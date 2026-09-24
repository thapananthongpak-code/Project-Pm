import { useTheme } from '../hooks/useTheme'

export type View = 'wizard' | 'checker'

const tabs: { id: View; label: string }[] = [
  { id: 'wizard', label: 'สร้าง' },
  { id: 'checker', label: 'ตรวจ prompt' },
]

interface Props {
  view: View
  onNavigate: (view: View) => void
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

export function Header({ view, onNavigate }: Props) {
  const { dark, toggle } = useTheme()

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-2xl items-center gap-2 px-4">
        <button
          type="button"
          onClick={() => onNavigate('wizard')}
          aria-label="PromptFolio หน้าแรก"
          className="mr-auto flex items-center gap-2 rounded-xl font-display text-lg font-bold"
        >
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="size-7" />
          <span aria-hidden="true" className="hidden min-[420px]:inline">
            PromptFolio
          </span>
        </button>
        <nav aria-label="เมนูหลัก">
          <ul className="flex rounded-2xl bg-sunken p-1">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  type="button"
                  onClick={() => onNavigate(tab.id)}
                  aria-current={view === tab.id ? 'page' : undefined}
                  className={`min-h-10 whitespace-nowrap rounded-xl px-3 text-[15px] font-semibold transition ${
                    view === tab.id ? 'bg-surface text-ink shadow-soft' : 'text-muted hover:text-ink'
                  }`}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <button
          type="button"
          onClick={toggle}
          className="grid size-11 place-items-center rounded-xl text-muted hover:bg-sunken hover:text-ink"
          aria-label={dark ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
        >
          <ThemeIcon dark={dark} />
        </button>
      </div>
    </header>
  )
}
