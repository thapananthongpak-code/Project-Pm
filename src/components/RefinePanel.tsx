import { useState } from 'react'
import { CopyButton } from './CopyButton'

interface Props {
  title: string
  options: { id: string; label: string }[]
  /** สร้างข้อความ prompt ของตัวเลือกนั้น */
  build: (id: string) => string
}

/** ปุ่มปรับเพิ่ม เลือกแล้วคัดลอกไปวางต่อในแชทเดิม */
export function RefinePanel({ title, options, build }: Props) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="card p-4 sm:p-5">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-[15px] text-muted">เลือกแล้วคัดลอกไปวางต่อในแชทเดิม</p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={selected === o.id}
            onClick={() => setSelected(selected === o.id ? null : o.id)}
            className={`min-h-12 rounded-2xl border px-3 font-medium transition ${
              selected === o.id ? 'border-brand-600 bg-brand-600 text-white' : 'border-line bg-surface hover:border-brand-300'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {selected && (
        <div className="mt-3">
          <pre className="whitespace-pre-wrap wrap-break-word rounded-2xl border border-line bg-sunken p-4 font-sans text-[15px] leading-relaxed">
            {build(selected)}
          </pre>
          <CopyButton key={selected} text={build(selected)} className="mt-3 w-full" />
        </div>
      )}
    </div>
  )
}
