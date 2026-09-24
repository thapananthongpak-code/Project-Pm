import type { Step } from '../hooks/useWizard'

const labels = ['เลือกหัวข้อ', 'ตอบคำถาม', 'เลือกเครื่องมือ', 'ได้ prompt']

interface Props {
  step: Step
  page: number
  pageTotal: number
}

export function ProgressBar({ step, page, pageTotal }: Props) {
  const withinForm = step === 1 && pageTotal > 0 ? page / pageTotal : 0
  const percent = Math.round(((step + withinForm) / 3) * 100)

  return (
    <div className="mb-6">
      <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">
        ขั้นที่ {step + 1}/4 · {labels[step]}
        {step === 1 && pageTotal > 0 && (
          <span className="font-normal text-muted">
            {' '}
            ({Math.min(page + 1, pageTotal)}/{pageTotal})
          </span>
        )}
      </p>
      <div
        role="progressbar"
        aria-label="ความคืบหน้า"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="mt-2 h-2.5 overflow-hidden rounded-full bg-brand-100 dark:bg-brand-900"
      >
        <div
          className="h-full rounded-full bg-linear-to-r from-brand-500 via-sea-500 to-accent-400 transition-[width] duration-500"
          style={{ width: `${Math.max(percent, 4)}%` }}
        />
      </div>
    </div>
  )
}
