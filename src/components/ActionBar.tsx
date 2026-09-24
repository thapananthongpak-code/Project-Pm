import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { container } from './layout'

/** แถบปุ่มย้อนกลับ/ถัดไป ติดล่างจอเสมอ กดง่ายด้วยนิ้วโป้งทุกอุปกรณ์ */
export function ActionBar({ children }: { children: ReactNode }) {
  return (
    <>
      {/* เว้นที่ไว้ไม่ให้แถบบังเนื้อหาช่วงล่าง */}
      <div aria-hidden="true" className="h-24" />
      {/* ส่งไปที่ body: ถ้าอยู่ใต้ element ที่มี animation (transform) position: fixed จะไม่ยึดกับจอ */}
      {createPortal(
        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-bg/90 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
          <div className={`${container} flex gap-3`}>{children}</div>
        </div>,
        document.body,
      )}
    </>
  )
}
