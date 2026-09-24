import { useState } from 'react'
import { Header, type View } from './components/Header'
import { container } from './components/layout'
import { PromptChecker } from './components/PromptChecker'
import { ToastProvider } from './components/Toast'
import { Wizard } from './components/Wizard'
import { useWizard } from './hooks/useWizard'

export default function App() {
  const [view, setView] = useState<View>('wizard')
  const wizard = useWizard()

  function navigate(next: View) {
    setView(next)
    window.scrollTo({ top: 0 })
  }

  return (
    <ToastProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-surface focus:px-4 focus:py-2"
      >
        ข้ามไปเนื้อหาหลัก
      </a>
      <Header view={view} onNavigate={navigate} />
      <main id="main" className={`${container} flex-1 pb-10 pt-6 lg:pt-10`}>
        {view === 'wizard' ? <Wizard wizard={wizard} /> : <PromptChecker />}
      </main>
    </ToastProvider>
  )
}
