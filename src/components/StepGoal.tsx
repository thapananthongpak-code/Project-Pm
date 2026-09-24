import { goals } from '../data'
import type { GoalId } from '../types'

interface Props {
  value: GoalId | null
  onSelect: (goal: GoalId) => void
  onBrowseTemplates: () => void
}

export function StepGoal({ value, onSelect, onBrowseTemplates }: Props) {
  return (
    <section aria-labelledby="step-heading" className="animate-step-in">
      <h2 id="step-heading" tabIndex={-1} className="text-2xl font-bold">
        อยากทำสไลด์แบบไหน?
      </h2>
      <p className="mt-1 text-muted">เลือก 1 อย่าง แล้วเราจะถามเฉพาะเรื่องที่จำเป็น</p>

      <div role="radiogroup" aria-labelledby="step-heading" className="mt-5 grid gap-3 sm:grid-cols-2">
        {goals.map((goal) => {
          const selected = value === goal.id
          return (
            <button
              key={goal.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(goal.id)}
              className={`card flex items-start gap-4 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lift ${
                selected ? 'border-2 border-brand-500 bg-brand-50 dark:bg-brand-900/40' : ''
              }`}
            >
              <span
                aria-hidden="true"
                className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-100 to-sea-100 text-3xl dark:from-brand-800 dark:to-sea-700"
              >
                {goal.emoji}
              </span>
              <span>
                <span className="block font-display text-lg font-semibold">{goal.title}</span>
                <span className="mt-0.5 block text-[15px] leading-snug text-muted">{goal.description}</span>
              </span>
            </button>
          )
        })}
      </div>

      <p className="mt-6 text-center text-muted">
        อยากดูตัวอย่างก่อน?{' '}
        <button
          type="button"
          onClick={onBrowseTemplates}
          className="min-h-10 rounded-lg font-semibold text-brand-700 underline underline-offset-4 dark:text-brand-300"
        >
          เปิดคลังเทมเพลต
        </button>
      </p>
    </section>
  )
}
