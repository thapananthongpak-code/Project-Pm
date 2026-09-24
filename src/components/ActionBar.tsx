import type { ReactNode } from 'react'

/** แถบปุ่มย้อนกลับ/ถัดไป ติดล่างจอ กดง่ายด้วยนิ้วโป้ง */
export function ActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-8 border-t border-line bg-bg/90 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
      <div className="flex gap-3">{children}</div>
    </div>
  )
}
