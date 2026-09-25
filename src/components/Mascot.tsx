import type { ReactNode } from 'react'

export type Mood = 'idle' | 'happy' | 'think' | 'wow' | 'sad'

export const MASCOT_NAME = 'พี่ไตเติ้ล'

/** ท่าทางตามอารมณ์ (รูปนิ่ง จึงใช้การเคลื่อนไหวแทนสีหน้า) */
const moodMotion: Record<Mood, string> = {
  idle: '',
  happy: 'animate-wiggle',
  think: '-rotate-6',
  wow: 'scale-110',
  sad: 'animate-shake',
}

/** มาสคอต "พี่ไตเติ้ล" ลอยขึ้นลง และขยับตามอารมณ์ */
export function Mascot({ mood = 'idle', className = '' }: { mood?: Mood; className?: string }) {
  return (
    <span aria-hidden="true" className={`inline-block animate-float ${className}`}>
      <img
        key={mood}
        src={`${import.meta.env.BASE_URL}mascot-title.jpg`}
        alt=""
        width={512}
        height={512}
        draggable={false}
        className={`size-full rounded-full object-cover shadow-lift ring-4 ring-white transition duration-300 dark:ring-brand-800 ${moodMotion[mood]}`}
      />
    </span>
  )
}

/** มาสคอตพร้อมกล่องคำพูด */
export function MascotTip({ mood = 'idle', children, className = '' }: { mood?: Mood; children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-end gap-3 ${className}`}>
      <Mascot mood={mood} className="size-16 shrink-0 sm:size-20" />
      <div
        role="note"
        className="relative mb-2 animate-bounce-in rounded-2xl rounded-bl-sm border border-line bg-surface px-4 py-3 text-[15px] shadow-soft"
      >
        <span className="block text-xs font-bold text-brand-700 dark:text-brand-300">{MASCOT_NAME}</span>
        {children}
      </div>
    </div>
  )
}
