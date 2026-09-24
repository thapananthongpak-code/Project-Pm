import { imageTools, tools } from '../data'
import type { GoalId, ToolId } from '../types'
import { ActionBar } from './ActionBar'

interface Props {
  goal: GoalId
  value: ToolId | null
  onSelect: (tool: ToolId) => void
  onBack: () => void
  onNext: () => void
}

export function StepTool({ goal, value, onSelect, onBack, onNext }: Props) {
  return (
    <section aria-labelledby="step-heading" className="animate-step-in">
      <h2 id="step-heading" tabIndex={-1} className="text-2xl font-bold">
        ใช้ AI ตัวไหน?
      </h2>

      <div role="radiogroup" aria-labelledby="step-heading" className="mt-4 grid gap-3 md:grid-cols-3 lg:gap-5">
        {tools.map((tool) => {
          const selected = value === tool.id
          return (
            <button
              key={tool.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(tool.id)}
              className={`card flex w-full items-center justify-between gap-4 p-4 text-left transition hover:border-brand-300 md:min-h-32 md:p-6 ${
                selected ? 'border-brand-500 ring-2 ring-brand-500' : ''
              }`}
            >
              <span>
                <span className="block font-display text-lg font-semibold">{tool.name}</span>
                <span className="block text-[15px] text-muted">
                  {(goal === 'image' && imageTools.find((t) => t.id === tool.id)?.short) || tool.blurb}
                </span>
              </span>
              <span
                aria-hidden="true"
                className={`grid size-6 shrink-0 place-items-center rounded-full border-2 ${
                  selected ? 'border-brand-600 bg-brand-600' : 'border-line'
                }`}
              >
                {selected && <span className="size-2 rounded-full bg-white" />}
              </span>
            </button>
          )
        })}
      </div>

      <ActionBar>
        <button type="button" onClick={onBack} className="btn-ghost">
          ย้อนกลับ
        </button>
        <button type="button" onClick={onNext} disabled={!value} className="btn-primary flex-1 text-lg">
          ดู prompt
        </button>
      </ActionBar>
    </section>
  )
}
