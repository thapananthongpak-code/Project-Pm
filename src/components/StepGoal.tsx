import { goals } from '../data'
import type { GoalId } from '../types'

interface Props {
  value: GoalId | null
  onSelect: (goal: GoalId) => void
}

export function StepGoal({ value, onSelect }: Props) {
  return (
    <section aria-labelledby="step-heading" className="animate-step-in">
      <h2 id="step-heading" tabIndex={-1} className="text-2xl font-bold">
        อยากทำอะไร?
      </h2>

      <div role="radiogroup" aria-labelledby="step-heading" className="mt-4 grid gap-3 sm:grid-cols-2">
        {goals.map((goal) => {
          const selected = value === goal.id
          return (
            <button
              key={goal.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(goal.id)}
              className={`card flex items-center gap-4 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lift ${
                selected ? 'border-2 border-brand-500 bg-brand-50 dark:bg-brand-900/40' : ''
              }`}
            >
              <span
                aria-hidden="true"
                className="grid size-14 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-brand-100 to-sea-100 text-3xl dark:from-brand-800 dark:to-sea-700"
              >
                {goal.emoji}
              </span>
              <span>
                <span className="block font-display text-lg font-semibold">{goal.title}</span>
                <span className="block text-[15px] leading-snug text-muted">{goal.description}</span>
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
