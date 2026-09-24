import type { Step } from '../hooks/useWizard'

const labels = ['เป้าหมาย', 'ตอบคำถาม', 'เครื่องมือ', 'ผลลัพธ์']

interface Props {
  step: Step
  page: number
  pageTotal: number
  saved: boolean
  onStepClick: (step: Step) => void
}

export function ProgressBar({ step, page, pageTotal, saved, onStepClick }: Props) {
  const withinForm = step === 1 && pageTotal > 0 ? page / pageTotal : 0
  const percent = Math.round(((step + withinForm) / 3) * 100)

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-brand-700 dark:text-brand-300">
          ขั้นที่ {step + 1}/4 · {labels[step]}
          {step === 1 && pageTotal > 0 && (
            <span className="font-normal text-muted">
              {' '}
              (หัวข้อ {Math.min(page + 1, pageTotal)}/{pageTotal})
            </span>
          )}
        </span>
        {saved && (
          <span className="flex items-center gap-1 text-muted">
            <span aria-hidden="true">💾</span> บันทึกอัตโนมัติ
          </span>
        )}
      </div>

      <div
        role="progressbar"
        aria-label="ความคืบหน้า"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="mt-2 h-3 overflow-hidden rounded-full bg-brand-100 dark:bg-brand-900"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 via-sea-500 to-accent-400 transition-[width] duration-500"
          style={{ width: `${Math.max(percent, 4)}%` }}
        />
      </div>

      <ol className="mt-3 grid grid-cols-4 gap-1 text-center text-xs sm:text-sm">
        {labels.map((label, i) => {
          const s = i as Step
          const done = s < step
          const current = s === step
          return (
            <li key={label}>
              <button
                type="button"
                disabled={!done}
                onClick={() => onStepClick(s)}
                aria-current={current ? 'step' : undefined}
                className={`flex w-full flex-col items-center gap-1 rounded-xl py-1 ${done ? 'hover:bg-brand-50 dark:hover:bg-brand-900/50' : ''}`}
              >
                <span
                  className={`grid size-7 place-items-center rounded-full text-sm font-bold ${
                    current
                      ? 'bg-brand-600 text-white'
                      : done
                        ? 'bg-sea-500 text-white'
                        : 'bg-sunken text-muted ring-1 ring-line'
                  }`}
                >
                  {done ? '✓' : i + 1}
                </span>
                <span className={current ? 'font-semibold text-ink' : 'text-muted'}>{label}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
