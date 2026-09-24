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

      <div role="radiogroup" aria-labelledby="step-heading" className="mt-4 grid gap-3 md:grid-cols-3 lg:gap-5">
        {goals.map((goal) => {
          const selected = value === goal.id
          return (
            <button
              key={goal.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(goal.id)}
              className={`card flex w-full items-center justify-between gap-4 p-5 text-left transition hover:border-brand-300 md:min-h-44 md:flex-col md:items-start md:p-6 lg:min-h-52 ${
                selected ? 'border-brand-500 ring-2 ring-brand-500' : ''
              }`}
            >
              <span>
                <span className="block font-display text-lg font-semibold lg:text-2xl">{goal.title}</span>
                <span className="block text-[15px] text-muted">{goal.description}</span>
              </span>
              <span aria-hidden="true" className="text-xl text-muted md:self-end md:text-2xl">
                →
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
