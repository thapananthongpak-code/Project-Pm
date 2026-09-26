/** พื้นหลัง: แสงสีจางๆ ลอยช้าๆ ไม่รบกวนการอ่าน */
export function Backdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-24 -top-24 size-80 animate-drift rounded-full bg-brand-300/25 blur-3xl dark:bg-brand-700/25" />
      <div
        className="absolute -right-20 top-1/3 size-72 animate-drift rounded-full bg-sea-300/25 blur-3xl dark:bg-sea-700/20"
        style={{ animationDelay: '-7s' }}
      />
      <div
        className="absolute -bottom-24 left-1/4 size-80 animate-drift rounded-full bg-accent-200/30 blur-3xl dark:bg-accent-700/15"
        style={{ animationDelay: '-14s' }}
      />
      <div
        className="absolute bottom-10 right-1/4 size-56 animate-drift rounded-full bg-mint-200/30 blur-3xl dark:bg-mint-700/15"
        style={{ animationDelay: '-3s' }}
      />
    </div>
  )
}
