import { useCallback, useEffect, useRef, useState } from 'react'
import { layout } from '../scene/layout'
import { DialogBox } from './DialogBox'
import { demoLines } from './demoLines'

// Скорость печати: 35 знаков в секунду (выбрано на этапе 3)
const TYPING_SPEED = 35

// Ведёт диалог: клик, пробел или Enter дописывают реплику, следующий — показывают следующую.
export function Dialog() {
  const [index, setIndex] = useState(0)
  const skipRef = useRef<(() => boolean) | null>(null)
  const line = demoLines[index]

  const advance = useCallback(() => {
    if (skipRef.current?.()) return
    if (line.choices) return
    setIndex((i) => Math.min(i + 1, demoLines.length - 1))
  }, [line])

  useEffect(() => {
    const onClick = () => advance()
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== ' ' && e.key !== 'Enter') return
      // На кнопке выбора пробел и Enter нажимают саму кнопку
      if ((e.target as HTMLElement).closest('button')) return
      e.preventDefault()
      advance()
    }
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [advance])

  return (
    <DialogBox
      box={layout.dialogBox}
      speaker={line.speaker}
      text={line.text}
      choices={line.choices}
      cps={TYPING_SPEED}
      skipRef={skipRef}
      // Пока выборы пробные — любой ответ возвращает к началу
      onChoose={() => setIndex(0)}
    />
  )
}
