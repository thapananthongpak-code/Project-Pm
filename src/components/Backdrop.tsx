/**
 * พื้นหลัง: แสงสีจางๆ ลอยช้าๆ ไม่รบกวนการอ่าน
 * ใช้ไล่สีวงกลม ไม่ใช้ filter blur (เบลอก้อนใหญ่ที่ขยับตลอด ทำให้จอกระพริบในเครื่องการ์ดจอเล็ก)
 */
export function Backdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-40 -top-40 size-[28rem] animate-drift rounded-full bg-radial from-brand-300/25 to-transparent to-70% dark:from-brand-700/25" />
      <div
        className="absolute -right-36 top-1/4 size-[26rem] animate-drift rounded-full bg-radial from-sea-300/25 to-transparent to-70% dark:from-sea-700/20"
        style={{ animationDelay: '-7s' }}
      />
      <div
        className="absolute -bottom-40 left-1/5 size-[28rem] animate-drift rounded-full bg-radial from-accent-200/30 to-transparent to-70% dark:from-accent-700/15"
        style={{ animationDelay: '-14s' }}
      />
      <div
        className="absolute bottom-0 right-1/5 size-[22rem] animate-drift rounded-full bg-radial from-mint-200/30 to-transparent to-70% dark:from-mint-700/15"
        style={{ animationDelay: '-3s' }}
      />
    </div>
  )
}
