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

      <div role="radiogroup" aria-labelledby="step-heading" className="mt-4 space-y-3">
        {goals.map((goal) => {
          const selected = value === goal.id
          return (
            <button
              key={goal.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(goal.id)}
              className={`card flex w-full items-center justify-between gap-4 p-5 text-left transition hover:border-brand-300 ${
                selected ? 'border-brand-500 ring-2 ring-brand-500' : ''
              }`}
            >
              <span>
                <span className="block font-display text-lg font-semibold">{goal.title}</span>
                <span className="block text-[15px] text-muted">{goal.description}</span>
              </span>
              <span aria-hidden="true" className="text-xl text-muted">
                →
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
