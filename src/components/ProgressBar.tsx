import type { Step } from '../hooks/useWizard'

const labels = ['เลือกหัวข้อ', 'ตอบคำถาม', 'เลือก AI', 'ได้ prompt']

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
      <p className="text-sm text-muted">
        ขั้นที่ {step + 1} จาก 4 · {labels[step]}
        {step === 1 && pageTotal > 0 && ` (${Math.min(page + 1, pageTotal)}/${pageTotal})`}
      </p>
      <div
        role="progressbar"
        aria-label="ความคืบหน้า"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-line"
      >
        <div
          className="h-full rounded-full bg-brand-600 transition-[width] duration-500 dark:bg-brand-400"
          style={{ width: `${Math.max(percent, 3)}%` }}
        />
      </div>
    </div>
  )
}
