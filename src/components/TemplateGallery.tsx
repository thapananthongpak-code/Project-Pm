import { useState } from 'react'
import { goals, samples, templates } from '../data'
import { previewTemplate } from '../lib/promptBuilder'
import type { PromptTemplate, Sample, TemplateStage } from '../types'
import { CopyButton } from './CopyButton'

interface Props {
  onUse: (template: PromptTemplate) => void
  onTrySample: (sample: Sample) => void
}

const stageInfo: Record<TemplateStage, { label: string; className: string }> = {
  content: { label: 'ขั้น ก · เขียนเนื้อหา', className: 'bg-brand-100 text-brand-800 dark:bg-brand-800 dark:text-brand-100' },
  design: { label: 'ขั้น ข · เจนดีไซน์', className: 'bg-sea-100 text-sea-700 dark:bg-sea-700 dark:text-sea-50' },
  refine: { label: 'ต่อยอด', className: 'bg-accent-100 text-accent-700 dark:bg-accent-700 dark:text-accent-50' },
}

const filters: { id: TemplateStage | 'all'; label: string }[] = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'content', label: 'เขียนเนื้อหา' },
  { id: 'design', label: 'เจนดีไซน์' },
  { id: 'refine', label: 'ต่อยอด' },
]

function TemplateCard({ template, onUse, onTrySample }: { template: PromptTemplate } & Props) {
  const [mode, setMode] = useState<'sample' | 'blank'>('sample')
  const sample = samples.find((s) => s.id === template.sampleId)
  const text =
    mode === 'sample' && sample
      ? previewTemplate(template, sample.answers, sample.goal)
      : previewTemplate(template, null, null)
  const stage = stageInfo[template.stage]

  return (
    <article className="card animate-step-in p-5">
      <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${stage.className}`}>
        {stage.label}
      </span>
      <h3 className="mt-2 text-xl font-semibold">{template.title}</h3>
      <p className="mt-1 text-muted">{template.description}</p>
      <p className="mt-2 flex flex-wrap gap-1.5 text-sm">
        <span className="sr-only">ใช้กับ:</span>
        {template.goals.map((id) => {
          const g = goals.find((x) => x.id === id)
          return (
            <span key={id} className="rounded-full border border-line px-2.5 py-0.5 text-muted">
              <span aria-hidden="true">{g?.emoji} </span>
              {g?.title}
            </span>
          )
        })}
      </p>

      <div role="group" aria-label="รูปแบบตัวอย่าง" className="mt-4 inline-flex rounded-2xl bg-sunken p-1">
        {(['sample', 'blank'] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
            className={`min-h-10 rounded-xl px-3 text-sm font-semibold transition ${
              mode === m ? 'bg-surface text-ink shadow-soft' : 'text-muted hover:text-ink'
            }`}
          >
            {m === 'sample' ? 'ตัวอย่างที่เติมแล้ว' : 'แบบเปล่า'}
          </button>
        ))}
      </div>
      {mode === 'sample' && sample && template.stage !== 'refine' && (
        <p className="mt-2 text-sm text-muted">ข้อมูลของ: {sample.label} (ตัวอย่างสมมติ)</p>
      )}
      <pre
        tabIndex={0}
        aria-label={`ตัวอย่าง ${template.title}`}
        className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-2xl border border-line bg-sunken p-4 font-sans text-[15px] leading-relaxed"
      >
        {text}
      </pre>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => onUse(template)} className="btn-primary">
          ใช้เทมเพลตนี้ <span aria-hidden="true">→</span>
        </button>
        <CopyButton text={text} variant="ghost" label="คัดลอกตามที่เห็น" />
      </div>
      {sample && template.stage === 'content' && (
        <button
          type="button"
          onClick={() => onTrySample(sample)}
          className="mt-2 min-h-11 w-full rounded-xl text-[15px] font-semibold text-brand-700 underline underline-offset-4 dark:text-brand-300"
        >
          ลองกับข้อมูลตัวอย่างของ {sample.answers.nickname || sample.label}
        </button>
      )}
    </article>
  )
}

export function TemplateGallery({ onUse, onTrySample }: Props) {
  const [filter, setFilter] = useState<TemplateStage | 'all'>('all')
  const shown = templates.filter((t) => filter === 'all' || t.stage === filter)

  return (
    <section aria-labelledby="page-heading" className="animate-step-in">
      <h1 id="page-heading" className="text-2xl font-bold">
        คลังเทมเพลต prompt
      </h1>
      <p className="mt-1 text-muted">
        ดูตัวอย่าง prompt ที่ดี แล้วกด “ใช้เทมเพลตนี้” เพื่อเติมข้อมูลของตัวเอง
      </p>

      <div role="group" aria-label="กรองตามขั้น" className="mt-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`min-h-11 rounded-full border-2 px-4 font-medium transition ${
              filter === f.id
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-line bg-surface hover:border-brand-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        {shown.map((t) => (
          <TemplateCard key={t.id} template={t} onUse={onUse} onTrySample={onTrySample} />
        ))}
      </div>
    </section>
  )
}
