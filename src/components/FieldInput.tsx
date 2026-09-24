import { byGoal } from '../lib/byGoal'
import type { Field, GoalId } from '../types'

interface Props {
  field: Field
  goal: GoalId
  value: string
  error?: string
  /** ไม่แสดงป้าย "(ไม่บังคับ)" */
  hideOptional?: boolean
  onChange: (value: string) => void
}

export function FieldInput({ field, goal, value, error, hideOptional, onChange }: Props) {
  const id = `f-${field.id}`
  const label = byGoal(field.label, goal)
  const placeholder = byGoal(field.placeholder, goal)
  const example = byGoal(field.example, goal)
  const errorId = `${id}-error`

  const labelText = (
    <>
      {label}
      {field.required ? (
        <span className="text-accent-700 dark:text-accent-300">
          {' '}
          *<span className="sr-only">(จำเป็น)</span>
        </span>
      ) : (
        !hideOptional && <span className="text-sm font-normal text-muted"> (ไม่บังคับ)</span>
      )}
    </>
  )

  return (
    <div>
      {field.type === 'chips' ? (
        <fieldset id={id} aria-describedby={error ? errorId : undefined}>
          <legend className="font-semibold">{labelText}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {field.options?.map((option) => {
              const selected = value === option
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={selected}
                  // กดซ้ำเพื่อยกเลิก
                  onClick={() => onChange(selected ? '' : option)}
                  className={`min-h-11 rounded-2xl border-2 px-3.5 font-medium transition ${
                    selected
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-line bg-surface hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/40'
                  }`}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </fieldset>
      ) : (
        <>
          <label htmlFor={id} className="block font-semibold">
            {labelText}
          </label>
          {field.type === 'textarea' ? (
            <textarea
              id={id}
              rows={3}
              value={value}
              placeholder={placeholder}
              onChange={(e) => onChange(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              className="field mt-2 resize-y"
            />
          ) : (
            <input
              id={id}
              type="text"
              value={value}
              placeholder={placeholder}
              onChange={(e) => onChange(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              className="field mt-2"
            />
          )}
        </>
      )}

      {error && (
        <p id={errorId} role="alert" className="mt-2 font-medium text-accent-700 dark:text-accent-300">
          {error}
        </p>
      )}

      {example && (
        <details className="group mt-2 text-[15px]">
          <summary className="inline-flex min-h-10 cursor-pointer list-none items-center gap-1 rounded-xl font-semibold text-sea-700 dark:text-sea-300">
            <span aria-hidden="true" className="transition group-open:rotate-90">
              ›
            </span>
            ดูตัวอย่าง
          </summary>
          <div className="rounded-2xl bg-sunken p-3">
            <p className="whitespace-pre-line text-muted">{example}</p>
            <button
              type="button"
              onClick={() => onChange(example)}
              className="mt-1 min-h-10 rounded-xl font-semibold text-brand-700 underline underline-offset-4 dark:text-brand-300"
            >
              ใช้ตัวอย่างนี้ แล้วแก้เป็นของตัวเอง
            </button>
          </div>
        </details>
      )}
    </div>
  )
}
