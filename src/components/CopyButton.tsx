import { useEffect, useState } from 'react'
import { copyText } from '../lib/clipboard'
import { useToast } from './Toast'

interface Props {
  text: string
  label?: string
  /** ข้อความแจ้งเตือนหลังคัดลอก */
  toast?: string
  variant?: 'accent' | 'ghost' | 'link'
  className?: string
}

const variants = {
  accent: 'btn-accent',
  ghost: 'btn-ghost',
  link: 'min-h-10 rounded-xl font-semibold text-brand-700 underline underline-offset-4 dark:text-brand-300',
}

export function CopyButton({
  text,
  label = 'คัดลอก',
  toast = 'คัดลอกแล้ว วางในแชทได้เลย',
  variant = 'accent',
  className = '',
}: Props) {
  const notify = useToast()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const t = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(t)
  }, [copied])

  async function handleClick() {
    const ok = await copyText(text)
    if (ok) {
      setCopied(true)
      notify(toast)
    } else {
      notify('คัดลอกไม่สำเร็จ ลองกดค้างที่ข้อความแล้วเลือก "คัดลอก"')
    }
  }

  return (
    <button type="button" onClick={handleClick} className={`${variants[variant]} ${className}`}>
      {copied ? 'คัดลอกแล้ว' : label}
    </button>
  )
}
