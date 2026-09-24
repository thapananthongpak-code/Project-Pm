import { imageStyles, imageSubjects } from '../data'
import { buildImagePrompt, imageChoice } from '../lib/promptBuilder'
import type { Answers, Field, GoalId, Tool } from '../types'
import { FieldInput } from './FieldInput'
import { PromptCard } from './PromptCard'

interface Props {
  goal: GoalId
  answers: Answers
  tool: Tool
  onAnswer: (id: string, value: string) => void
}

const fields: Field[] = [
  { id: 'imageSubject', label: 'รูปอะไร', type: 'chips', options: imageSubjects.map((s) => s.label) },
  { id: 'imageStyle', label: 'สไตล์', type: 'chips', options: imageStyles.map((s) => s.label) },
  { id: 'imageLook', label: 'หน้าตาตัวละคร', type: 'text', placeholder: 'เช่น ผมสั้น ใส่แว่น' },
]

export function ImagePrompt({ goal, answers, tool, onAnswer }: Props) {
  const choice = imageChoice(goal, answers, tool.id)
  // แสดงตัวเลือกที่ใช้อยู่ (รวมค่าเริ่มต้น) ให้ปุ่มถูกเลือกไว้เสมอ
  const shown: Answers = {
    imageSubject: choice.subject.label,
    imageStyle: choice.style.label,
    imageLook: answers.imageLook ?? '',
  }

  return (
    <PromptCard
      step={3}
      title="สร้างรูปการ์ตูน (ถ้าอยากได้)"
      subtitle="วางต่อในแชทเดิม"
      text={buildImagePrompt(goal, answers, tool.id)}
    >
      <div className="mt-4 space-y-4">
        {fields
          .filter((f) => f.id !== 'imageLook' || choice.subject.character)
          .map((field) => (
            <FieldInput
              key={field.id}
              field={field}
              goal={goal}
              value={shown[field.id]}
              hideOptional={field.type === 'chips'}
              // กดปุ่มที่เลือกอยู่ซ้ำ ไม่ต้องยกเลิก (ต้องมีตัวเลือกเสมอ)
              onChange={(v) => (v || field.type === 'text' ? onAnswer(field.id, v) : undefined)}
            />
          ))}
      </div>
      {choice.tool.note && <p className="mt-3 rounded-2xl bg-sunken px-3 py-2 text-[15px] text-muted">{choice.tool.note}</p>}
    </PromptCard>
  )
}
