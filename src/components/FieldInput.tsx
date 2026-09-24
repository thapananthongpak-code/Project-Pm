import { byGoal } from '../lib/byGoal'
import type { Field, GoalId } from '../types'
import { useToast } from './Toast'

interface Props {
  field: Field
  goal: GoalId
  value: string
  error?: string
  onChange: (value: string) => void
}

export function FieldInput({ field, goal, value, error, onChange }: Props) {
  const notify = useToast()
  const id = `f-${field.id}`
  const label = byGoal(field.label, goal)
  const placeholder = byGoal(field.placeholder, goal)
  const example = byGoal(field.example, goal)
  const exampleId = `${id}-example`
  const errorId = `${id}-error`
  const describedBy = [example && exampleId, error && errorId].filter(Boolean).join(' ') || undefined

  const labelText = (
    <>
      {label}
      {field.required ? (
        <span className="text-accent-700 dark:text-accent-300">
          {' '}
          *<span className="sr-only">(จำเป็น)</span>
        </span>
      ) : (
        <span className="text-sm font-normal text-muted"> (ไม่บังคับ)</span>
      )}
    </>
  )

  return (
    <div>
      {field.type === 'chips' ? (
        <fieldset id={id} aria-describedby={describedBy}>
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
                  className={`min-h-12 rounded-2xl border-2 px-4 font-medium transition ${
                    selected
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-line bg-surface hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/40'
                  }`}
                >
                  {selected && <span aria-hidden="true">✓ </span>}
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
              rows={4}
              value={value}
              placeholder={placeholder}
              onChange={(e) => onChange(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={describedBy}
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
              aria-describedby={describedBy}
              className="field mt-2"
            />
          )}
        </>
      )}

      {error && (
        <p id={errorId} role="alert" className="mt-2 font-medium text-accent-700 dark:text-accent-300">
          ⚠️ {error}
        </p>
      )}

      {example && (
        <div id={exampleId} className="mt-2 rounded-2xl bg-sunken p-3 text-[15px]">
          <p className="font-semibold text-sea-700 dark:text-sea-300">ตัวอย่างคำตอบ</p>
          <p className="mt-0.5 whitespace-pre-line text-muted">{example}</p>
          <button
            type="button"
            onClick={() => {
              onChange(example)
              notify('ใส่ตัวอย่างแล้ว อย่าลืมแก้ให้เป็นเรื่องของตัวเองนะ')
            }}
            className="mt-1 min-h-10 rounded-xl font-semibold text-brand-700 underline underline-offset-4 dark:text-brand-300"
          >
            ใช้เป็นแนวทาง
          </button>
        </div>
      )}
    </div>
  )
}
