import { useCallback, useEffect, useRef, useState } from 'react'
import { layout } from '../scene/layout'
import { mainScript } from '../content/dialogues'
import type { Line } from '../content/script'
import { DialogBox } from './DialogBox'
import { isReturning, rememberVisit } from './visit'

// Скорость печати: 35 знаков в секунду (выбрано на этапе 3)
const TYPING_SPEED = 35

type Position = { scene: string; index: number }

// Ведёт диалог по сценарию: клик, пробел или Enter дописывают реплику, следующий — показывают следующую.
export function Dialog({ onEmotion }: { onEmotion: (emotion: string) => void }) {
  const [pos, setPos] = useState<Position>(() => ({
    scene: isReturning() ? mainScript.returnStart : mainScript.start,
    index: 0,
  }))
  // Временная реплика вместо раздела, который ещё не готов; после неё — снова вопрос
  const [interlude, setInterlude] = useState<string | null>(null)
  const skipRef = useRef<(() => boolean) | null>(null)

  useEffect(rememberVisit, [])

  const sceneLine = mainScript.scenes[pos.scene][pos.index]
  const line: Line = interlude ? { kind: 'line', text: interlude } : sceneLine

  useEffect(() => {
    if (line.emotion) onEmotion(line.emotion)
  }, [line.emotion, onEmotion])

  const advance = useCallback(() => {
    if (skipRef.current?.()) return
    if (interlude) return setInterlude(null)
    if (line.kind === 'question') return
    // В конце сцены окно остаётся с последней репликой
    setPos((p) => ({ ...p, index: Math.min(p.index + 1, mainScript.scenes[p.scene].length - 1) }))
  }, [interlude, line.kind])

  const choose = (i: number) => {
    if (line.kind !== 'question') return
    const answer = line.answers[i]
    if (answer.next) setPos({ scene: answer.next, index: 0 })
    else if (answer.section) setInterlude(`Раздел «${answer.section}» скоро появится — загляни чуть позже!`)
  }

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
      speaker="Полина"
      text={line.text}
      choices={line.kind === 'question' ? line.answers.map((a) => a.text) : undefined}
      cps={TYPING_SPEED}
      skipRef={skipRef}
      onChoose={choose}
    />
  )
}
