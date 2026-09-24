import type { ReactNode } from 'react'
import { CopyButton } from './CopyButton'

interface Props {
  badge: string
  title: string
  subtitle?: ReactNode
  text: string
  tone?: 'brand' | 'sea' | 'accent'
  copyToast?: string
}

const badgeTone = {
  brand: 'bg-brand-100 text-brand-800 dark:bg-brand-800 dark:text-brand-100',
  sea: 'bg-sea-100 text-sea-700 dark:bg-sea-700 dark:text-sea-50',
  accent: 'bg-accent-100 text-accent-700 dark:bg-accent-700 dark:text-accent-50',
}

/** ไฮไลต์ช่องที่ต้องเติม เช่น [__] หรือ [วางเนื้อหา...] */
function highlight(text: string) {
  return text.split(/(\[[^\]\n]*\])/g).map((part, i) =>
    /^\[[^\]\n]*\]$/.test(part) ? (
      <mark key={i} className="rounded-md bg-accent-100 px-1 text-accent-700 dark:bg-accent-700/40 dark:text-accent-200">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

export function PromptCard({ badge, title, subtitle, text, tone = 'brand', copyToast }: Props) {
  return (
    <article className="card animate-step-in p-4 sm:p-5">
      <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${badgeTone[tone]}`}>{badge}</span>
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      {subtitle && <p className="mt-0.5 text-[15px] text-muted">{subtitle}</p>}
      <pre
        tabIndex={0}
        aria-label={`ข้อความ ${title}`}
        className="mt-3 max-h-[28rem] overflow-auto whitespace-pre-wrap break-words rounded-2xl border border-line bg-sunken p-4 font-sans text-[15px] leading-relaxed"
      >
        {highlight(text)}
      </pre>
      <CopyButton text={text} className="mt-3 w-full text-lg" toast={copyToast} />
    </article>
  )
}
