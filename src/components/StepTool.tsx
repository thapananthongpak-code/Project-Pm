import { tools } from '../data'
import type { ToolId, ToolKind } from '../types'
import { ActionBar } from './ActionBar'

interface Props {
  value: ToolId | null
  onSelect: (tool: ToolId) => void
  onBack: () => void
  onNext: () => void
}

const groups: { kind: ToolKind; title: string; hint: string }[] = [
  { kind: 'content', title: 'เขียนเนื้อหา', hint: 'แชทกับ AI ให้ร่างข้อความทีละสไลด์' },
  { kind: 'design', title: 'เจนสไลด์', hint: 'ให้ AI จัดหน้าตาสไลด์ให้สวย' },
]

export function StepTool({ value, onSelect, onBack, onNext }: Props) {
  return (
    <section aria-labelledby="step-heading" className="animate-step-in">
      <h2 id="step-heading" tabIndex={-1} className="text-2xl font-bold">
        จะเอา prompt ไปใช้ที่ไหน?
      </h2>
      <p className="mt-1 text-muted">
        เลือกได้ 1 ตัว ไม่ว่าเลือกอะไรก็จะได้ prompt ครบ 2 ขั้น คือ <strong className="text-ink">ก. เขียนเนื้อหา</strong>{' '}
        และ <strong className="text-ink">ข. เจนดีไซน์</strong>
      </p>

      <div role="radiogroup" aria-labelledby="step-heading" className="mt-6 space-y-6">
        {groups.map((group) => (
          <div key={group.kind}>
            <h3 className="text-lg font-semibold">
              {group.title} <span className="text-[15px] font-normal text-muted">· {group.hint}</span>
            </h3>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              {tools
                .filter((t) => t.kind === group.kind)
                .map((tool) => {
                  const selected = value === tool.id
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => onSelect(tool.id)}
                      className={`card flex items-center gap-3 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lift sm:flex-col sm:items-start ${
                        selected ? 'border-2 border-brand-500 bg-brand-50 dark:bg-brand-900/40' : ''
                      }`}
                    >
                      <span aria-hidden="true" className="text-3xl">
                        {tool.emoji}
                      </span>
                      <span>
                        <span className="block font-display text-lg font-semibold">{tool.name}</span>
                        <span className="block text-sm leading-snug text-muted">{tool.blurb}</span>
                      </span>
                    </button>
                  )
                })}
            </div>
          </div>
        ))}
      </div>

      <ActionBar>
        <button type="button" onClick={onBack} className="btn-ghost">
          <span aria-hidden="true">←</span> ย้อนกลับ
        </button>
        <button type="button" onClick={onNext} disabled={!value} className="btn-primary flex-1 text-lg">
          {value ? 'ดู prompt ของฉัน' : 'เลือกเครื่องมือก่อน'} <span aria-hidden="true">→</span>
        </button>
      </ActionBar>
    </section>
  )
}
