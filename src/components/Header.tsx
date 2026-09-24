import { useTheme } from '../hooks/useTheme'

export type View = 'wizard' | 'templates' | 'checker' | 'checklist'

const tabs: { id: View; label: string; short?: string; emoji: string }[] = [
  { id: 'wizard', label: 'สร้าง', emoji: '✏️' },
  { id: 'templates', label: 'เทมเพลต', emoji: '📚' },
  { id: 'checker', label: 'ตรวจ prompt', short: 'ตรวจ', emoji: '🔍' },
  { id: 'checklist', label: 'เช็กลิสต์', emoji: '✅' },
]

interface Props {
  view: View
  onNavigate: (view: View) => void
}

export function Header({ view, onNavigate }: Props) {
  const { dark, toggle } = useTheme()

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <button
          type="button"
          onClick={() => onNavigate('wizard')}
          className="flex items-center gap-2 rounded-xl font-display text-xl font-bold"
        >
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="size-8" />
          <span>
            Prompt<span className="text-brand-600 dark:text-brand-300">Folio</span>
          </span>
        </button>
        <button
          type="button"
          onClick={toggle}
          className="btn-ghost size-12 px-0 text-xl"
          aria-label={dark ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
          title={dark ? 'โหมดสว่าง' : 'โหมดมืด'}
        >
          <span aria-hidden="true">{dark ? '☀️' : '🌙'}</span>
        </button>
      </div>
      <nav aria-label="เมนูหลัก" className="mx-auto max-w-3xl px-2">
        <ul className="grid grid-cols-4">
          {tabs.map((tab) => {
            const active = view === tab.id
            return (
              <li key={tab.id}>
                <button
                  type="button"
                  onClick={() => onNavigate(tab.id)}
                  aria-label={tab.label}
                  aria-current={active ? 'page' : undefined}
                  className={`flex min-h-12 w-full items-center whitespace-nowrap justify-center gap-1 border-b-[3px] px-1 text-sm font-semibold transition sm:text-base ${
                    active
                      ? 'border-brand-600 text-brand-700 dark:border-brand-300 dark:text-brand-200'
                      : 'border-transparent text-muted hover:text-ink'
                  }`}
                >
                  <span aria-hidden="true" className="hidden min-[400px]:inline">
                    {tab.emoji}
                  </span>
                  {tab.short ? (
                    <>
                      <span className="sm:hidden">{tab.short}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                    </>
                  ) : (
                    tab.label
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </header>
  )
}
