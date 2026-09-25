import confetti from 'canvas-confetti'

const colors = ['#5f3df0', '#1a6fe8', '#ff8a3d', '#16a970', '#ffd23f']

/** พลุกระดาษฉลองความสำเร็จ (ปิดเองถ้าผู้ใช้ตั้งค่าลดการเคลื่อนไหว) */
export function celebrate(power: 'small' | 'big' = 'big') {
  const base = { colors, disableForReducedMotion: true, zIndex: 60 }
  if (power === 'small') {
    void confetti({ ...base, particleCount: 60, spread: 70, origin: { y: 0.7 } })
    return
  }
  void confetti({ ...base, particleCount: 90, angle: 60, spread: 70, origin: { x: 0, y: 0.75 } })
  void confetti({ ...base, particleCount: 90, angle: 120, spread: 70, origin: { x: 1, y: 0.75 } })
  window.setTimeout(() => void confetti({ ...base, particleCount: 120, spread: 110, origin: { y: 0.55 } }), 250)
}
