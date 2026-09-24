import { useState } from 'react'
import { Checklist } from './components/Checklist'
import { Header, type View } from './components/Header'
import { PromptChecker } from './components/PromptChecker'
import { TemplateGallery } from './components/TemplateGallery'
import { ToastProvider } from './components/Toast'
import { Wizard } from './components/Wizard'
import { useWizard } from './hooks/useWizard'
import type { PromptTemplate, Sample } from './types'

export default function App() {
  const [view, setView] = useState<View>('wizard')
  const wizard = useWizard()
  const { state } = wizard

  function navigate(next: View) {
    setView(next)
    window.scrollTo({ top: 0 })
  }

  function applyTemplate(template: PromptTemplate) {
    if (template.stage === 'content') {
      const goal = state.goal && template.goals.includes(state.goal) ? state.goal : template.goals[0]
      wizard.selectGoal(goal)
    } else if (state.goal && state.toolId) {
      // เทมเพลตขั้น ข และต่อยอด อยู่ในหน้าผลลัพธ์
      wizard.goTo(3)
    } else {
      wizard.goTo(state.goal ? 1 : 0, 0)
    }
    navigate('wizard')
  }

  function trySample(sample: Sample) {
    if (wizard.hasAnswers && !window.confirm('คำตอบที่กรอกไว้จะถูกแทนที่ด้วยข้อมูลตัวอย่าง ต้องการต่อไหม?')) return
    wizard.loadSample(sample)
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
      <Header view={view} onNavigate={navigate} />
      <main id="main" className="mx-auto max-w-3xl px-4 pb-16 pt-6">
        {view === 'wizard' && <Wizard wizard={wizard} onNavigate={navigate} />}
        {view === 'templates' && <TemplateGallery onUse={applyTemplate} onTrySample={trySample} />}
        {view === 'checker' && <PromptChecker />}
        {view === 'checklist' && <Checklist goal={state.goal} answers={state.answers} />}
      </main>
      <footer className="border-t border-line py-6 text-center text-sm text-muted">
        PromptFolio · ข้อมูลทั้งหมดเก็บไว้ในเครื่องของคุณเท่านั้น
      </footer>
    </ToastProvider>
  )
}
