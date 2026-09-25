import { goals } from '../data'
import type { GoalId } from '../types'

interface Props {
  value: GoalId | null
  onSelect: (goal: GoalId) => void
}

/** สีประจำการ์ดภารกิจ */
const accents = [
  'from-brand-500 to-sea-500',
  'from-sea-500 to-mint-500',
  'from-accent-400 to-brand-500',
]

export function StepGoal({ value, onSelect }: Props) {
  return (
    <section aria-labelledby="step-heading" className="animate-step-in">
      <h2 id="step-heading" tabIndex={-1} className="text-2xl font-bold">
        เลือกภารกิจ
      </h2>

      <div role="radiogroup" aria-labelledby="step-heading" className="mt-4 grid gap-3 md:grid-cols-3 lg:gap-5">
        {goals.map((goal, i) => {
          const selected = value === goal.id
          return (
            <button
              key={goal.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(goal.id)}
              style={{ animationDelay: `${i * 90}ms` }}
              className={`card group relative flex w-full animate-fly-in items-center justify-between gap-4 overflow-hidden p-5 text-left transition duration-300 hover:-translate-y-1 hover:shadow-lift active:scale-[0.98] md:min-h-48 md:flex-col md:items-start md:p-6 ${
                selected ? 'ring-2 ring-brand-500' : ''
              }`}
            >
              {/* แถบสีด้านบนการ์ด */}
              <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1.5 bg-linear-to-r ${accents[i % accents.length]}`} />
              <span>
                <span className="block text-xs font-bold tracking-wide text-muted">ภารกิจที่ {i + 1}</span>
                <span className="block font-display text-lg font-semibold lg:text-2xl">{goal.title}</span>
                <span className="block text-[15px] text-muted">{goal.description}</span>
              </span>
              <span
                aria-hidden="true"
                className={`grid size-10 shrink-0 place-items-center rounded-full bg-linear-to-br text-white shadow-soft transition duration-300 group-hover:translate-x-1 md:self-end ${
                  accents[i % accents.length]
                }`}
              >
                →
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
