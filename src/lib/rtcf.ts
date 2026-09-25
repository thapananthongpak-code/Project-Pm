import type { RtcfPart } from '../types'

export const PARTS: RtcfPart[] = ['R', 'T', 'C', 'F']

/** หัวข้อของแต่ละส่วนในข้อความ prompt เช่น "บทบาท (Role):" */
export const partHeading: Record<RtcfPart, string> = {
  R: 'บทบาท (Role)',
  T: 'งาน (Task)',
  C: 'บริบท (Context)',
  F: 'รูปแบบ (Format)',
}

const HEADING = /^(บทบาท|งาน|บริบท|รูปแบบ) \((Role|Task|Context|Format)\):\s?(.*)$/

export interface Section {
  /** null = ข้อความที่ไม่อยู่ในส่วนไหน */
  part: RtcfPart | null
  /** ข้อความบนบรรทัดหัวข้อ (หลังเครื่องหมาย :) */
  lead: string
  lines: string[]
}

/** แบ่ง prompt ออกเป็นส่วน R/T/C/F ตามบรรทัดหัวข้อ */
export function splitSections(text: string): Section[] {
  const sections: Section[] = []
  for (const line of text.split('\n')) {
    const m = line.match(HEADING)
    if (m) {
      sections.push({ part: m[2][0] as RtcfPart, lead: m[3], lines: [] })
    } else if (sections.length === 0) {
      sections.push({ part: null, lead: '', lines: [line] })
    } else {
      sections[sections.length - 1].lines.push(line)
    }
  }
  return sections
}

/** คลาสสีของแต่ละส่วน (เขียนเต็มเพื่อให้ Tailwind หาเจอ) */
export const partStyle: Record<RtcfPart, { tile: string; soft: string; text: string; border: string; ring: string }> = {
  R: {
    tile: 'bg-brand-600 text-white',
    soft: 'bg-brand-50 dark:bg-brand-900/40',
    text: 'text-brand-700 dark:text-brand-300',
    border: 'border-brand-500',
    ring: 'ring-brand-500',
  },
  T: {
    tile: 'bg-sea-600 text-white',
    soft: 'bg-sea-50 dark:bg-sea-700/20',
    text: 'text-sea-700 dark:text-sea-300',
    border: 'border-sea-500',
    ring: 'ring-sea-500',
  },
  C: {
    tile: 'bg-accent-400 text-[#2b1400]',
    soft: 'bg-accent-50 dark:bg-accent-700/20',
    text: 'text-accent-700 dark:text-accent-300',
    border: 'border-accent-400',
    ring: 'ring-accent-400',
  },
  F: {
    tile: 'bg-mint-600 text-white',
    soft: 'bg-mint-50 dark:bg-mint-700/20',
    text: 'text-mint-700 dark:text-mint-300',
    border: 'border-mint-500',
    ring: 'ring-mint-500',
  },
}
