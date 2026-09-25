import { useState } from 'react'
import { Backdrop } from './components/Backdrop'
import { useGame } from './components/Game'
import { Header, type Menu, type View } from './components/Header'
import { container, SCHOOL } from './components/layout'
import { Lesson } from './components/Lesson'
import { ToastProvider } from './components/Toast'
import { Wizard } from './components/Wizard'
import { useWizard } from './hooks/useWizard'

export default function App() {
  const wizard = useWizard()
  const { game } = useGame()
  // เปิดครั้งแรก (ยังไม่มีเหรียญ ยังไม่ได้ตอบ) เริ่มที่บทเรียน
  const [view, setView] = useState<View>(() => (game.badges.length === 0 && !wizard.hasAnswers ? 'lesson' : 'wizard'))

  const { state } = wizard
  const inImage = state.goal === 'image' && state.step > 0
  // หน้าที่มีแถบปุ่มติดล่างจอ (ตอบคำถาม/เลือก AI) ไม่แสดง footer เพราะแถบจะบัง
  const showFooter = view !== 'wizard' || state.step === 0 || state.step === 3
  const active: Menu = view === 'lesson' ? 'lesson' : inImage ? 'image' : 'create'

  function navigate(next: View) {
    setView(next)
    window.scrollTo({ top: 0 })
  }

  function openMenu(menu: Menu) {
    if (menu === 'lesson') return navigate('lesson')
    if (menu === 'image') {
      // เข้าหัวข้อสร้างภาพทันที (ถ้าทำค้างอยู่ ทำต่อจากเดิม)
      if (!inImage) wizard.selectGoal('image')
    } else if (inImage) {
      // ออกจากสร้างภาพ กลับไปหน้าเลือกภารกิจ คำตอบยังอยู่
      wizard.goTo(0)
    }
    navigate('wizard')
  }

  return (
    <ToastProvider>
      <Backdrop />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-surface focus:px-4 focus:py-2"
      >
        ข้ามไปเนื้อหาหลัก
      </a>
      <Header active={active} onMenu={openMenu} />
      <main id="main" className={`${container} flex-1 pb-10 pt-6 lg:pt-8`}>
        {view === 'lesson' && <Lesson onGo={openMenu} />}
        {view === 'wizard' && <Wizard wizard={wizard} />}
      </main>
      {showFooter && (
      <footer className="border-t border-line py-5 text-center text-sm text-muted">
        <div className={container}>
          สื่อการสอนการเขียน Prompt ตามหลัก RTCF สำหรับนักเรียนชั้น ม.3
          <br />
          {SCHOOL}
        </div>
      </footer>
      )}
    </ToastProvider>
  )
}
