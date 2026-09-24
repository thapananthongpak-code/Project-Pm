import { imageStyles, imageSubjects, imageTools } from '../data'
import { buildImagePrompt, imageChoice, toolById } from '../lib/promptBuilder'
import type { Answers, Field, GoalId, ToolId } from '../types'
import { FieldInput } from './FieldInput'
import { PromptCard } from './PromptCard'

interface Props {
  goal: GoalId
  answers: Answers
  toolId: ToolId
  onAnswer: (id: string, value: string) => void
}

const toolNames = imageTools.map((t) => toolById(t.id)?.name ?? t.id)

const fields: Field[] = [
  { id: 'imageSubject', label: 'อยากได้รูปอะไร', type: 'chips', options: imageSubjects.map((s) => s.label) },
  { id: 'imageStyle', label: 'สไตล์การ์ตูน', type: 'chips', options: imageStyles.map((s) => s.label) },
  { id: 'imageLook', label: 'หน้าตาตัวละคร', type: 'text', placeholder: 'เช่น ผมสั้น ใส่แว่น ถือแล็ปท็อป' },
  { id: 'imageTool', label: 'ใช้กับ', type: 'chips', options: toolNames },
]

export function ImagePrompt({ goal, answers, toolId, onAnswer }: Props) {
  const choice = imageChoice(goal, answers, toolId)
  const toolName = toolById(choice.tool.id)?.name ?? ''
  // แสดงตัวเลือกที่ใช้อยู่ (รวมค่าเริ่มต้น) ให้ปุ่มถูกเลือกไว้เสมอ
  const shown: Answers = {
    imageSubject: choice.subject.label,
    imageStyle: choice.style.label,
    imageTool: toolName,
    imageLook: answers.imageLook ?? '',
  }

  return (
    <div className="card mt-5 p-5">
      <h3 className="font-display text-xl font-bold">
        <span aria-hidden="true">🖼️ </span>สร้างรูปการ์ตูน
      </h3>
      <p className="text-[15px] text-muted">เอาไปใส่ในสไลด์ ใช้กับ ChatGPT, Gemini หรือ Claude</p>

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

      {choice.tool.note && (
        <p className="mt-4 rounded-2xl bg-sunken px-3 py-2 text-[15px]">
          <span aria-hidden="true">ℹ️ </span>
          {choice.tool.note}
        </p>
      )}

      <div className="mt-4">
        <PromptCard
          badge="ขั้น ค · รูปการ์ตูน"
          tone="accent"
          title={`วางใน ${toolName}`}
          subtitle="ยังไม่ถูกใจ พิมพ์ต่อได้เลย เช่น “ขอพื้นหลังสีฟ้า” หรือ “ให้ยิ้มกว้างขึ้น”"
          text={buildImagePrompt(goal, answers, toolId)}
          copyToast={`คัดลอกแล้ว! ไปวางใน ${toolName} ได้เลย`}
        />
      </div>
    </div>
  )
}
