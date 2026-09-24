import { tools } from '../data'
import type { ToolId, ToolKind } from '../types'
import { ActionBar } from './ActionBar'

interface Props {
  value: ToolId | null
  onSelect: (tool: ToolId) => void
  onBack: () => void
  onNext: () => void
}

const groups: { kind: ToolKind; title: string }[] = [
  { kind: 'content', title: 'เขียนเนื้อหา' },
  { kind: 'design', title: 'ทำสไลด์' },
]

export function StepTool({ value, onSelect, onBack, onNext }: Props) {
  return (
    <section aria-labelledby="step-heading" className="animate-step-in">
      <h2 id="step-heading" tabIndex={-1} className="text-2xl font-bold">
        จะใช้กับเครื่องมือไหน?
      </h2>
      <p className="mt-1 text-muted">เลือกอันไหนก็ได้ prompt ครบทั้ง 2 ขั้น</p>

      <div role="radiogroup" aria-labelledby="step-heading" className="mt-5 space-y-5">
        {groups.map((group) => (
          <div key={group.kind}>
            <h3 className="font-semibold text-muted">{group.title}</h3>
            <div className="mt-2 grid grid-cols-3 gap-2">
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
                      className={`card flex min-h-24 flex-col items-center justify-center gap-1 p-2 text-center transition hover:shadow-lift ${
                        selected ? 'border-2 border-brand-500 bg-brand-50 dark:bg-brand-900/40' : ''
                      }`}
                    >
                      <span aria-hidden="true" className="text-2xl">
                        {tool.emoji}
                      </span>
                      <span className="text-[15px] font-semibold leading-tight">{tool.name}</span>
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
          {value ? 'ดู prompt' : 'เลือกก่อน'} <span aria-hidden="true">→</span>
        </button>
      </ActionBar>
    </section>
  )
}
