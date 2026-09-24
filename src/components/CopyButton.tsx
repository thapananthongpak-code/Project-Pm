import { useEffect, useState } from 'react'
import { copyText } from '../lib/clipboard'
import { useToast } from './Toast'

interface Props {
  text: string
  label?: string
  /** ข้อความแจ้งเตือนหลังคัดลอก */
  toast?: string
  variant?: 'accent' | 'ghost'
  className?: string
}

export function CopyButton({
  text,
  label = 'คัดลอก prompt',
  toast = 'คัดลอกแล้ว! ไปวางใน AI ได้เลย',
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
      notify(`✓ ${toast}`)
    } else {
      notify('คัดลอกไม่สำเร็จ ลองกดค้างที่ข้อความแล้วเลือก "คัดลอก"')
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${variant === 'accent' ? 'btn-accent' : 'btn-ghost'} ${className}`}
    >
      <span aria-hidden="true">{copied ? '✓' : '📋'}</span>
      {copied ? 'คัดลอกแล้ว' : label}
    </button>
  )
}
