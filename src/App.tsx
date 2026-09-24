import { useState } from 'react'
import { Header, type Menu, type View } from './components/Header'
import { container } from './components/layout'
import { PromptChecker } from './components/PromptChecker'
import { ToastProvider } from './components/Toast'
import { Wizard } from './components/Wizard'
import { useWizard } from './hooks/useWizard'

export default function App() {
  const [view, setView] = useState<View>('wizard')
  const wizard = useWizard()

  const { state } = wizard
  const inImage = state.goal === 'image' && state.step > 0
  const active: Menu = view === 'checker' ? 'checker' : inImage ? 'image' : 'create'

  function navigate(next: View) {
    setView(next)
    window.scrollTo({ top: 0 })
  }

  function openMenu(menu: Menu) {
    if (menu === 'checker') return navigate('checker')
    if (menu === 'image') {
      // เข้าหัวข้อสร้างภาพทันที (ถ้าทำค้างอยู่ ทำต่อจากเดิม)
      if (!inImage) wizard.selectGoal('image')
    } else if (inImage) {
      // ออกจากสร้างภาพ กลับไปหน้าเลือกหัวข้อ คำตอบยังอยู่
      wizard.goTo(0)
    }
    navigate('wizard')
  }

  return (
    <ToastProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-surface focus:px-4 focus:py-2"
      >
        ข้ามไปเนื้อหาหลัก
      </a>
      <Header active={active} onMenu={openMenu} onHome={() => navigate('wizard')} />
      <main id="main" className={`${container} flex-1 pb-10 pt-6 lg:pt-10`}>
        {view === 'wizard' ? <Wizard wizard={wizard} /> : <PromptChecker />}
      </main>
    </ToastProvider>
  )
}
