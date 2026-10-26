import { useEffect, type RefObject } from 'react'
import { motion } from 'motion/react'
import type { Rect } from '../scene/layout'
import { useTypewriter } from './useTypewriter'
import './DialogBox.css'

type Props = {
  box: Rect
  speaker: string
  text: string
  choices?: string[]
  cps: number
  variant: string
  appear: 'a' | 'b'
  onChoose?: (index: number) => void
  // Сюда окно кладёт функцию «дописать реплику»; true — клик потрачен на это
  skipRef: RefObject<(() => boolean) | null>
}

export function DialogBox({ box, speaker, text, choices, cps, variant, appear, onChoose, skipRef }: Props) {
  const { shown, rest, done, skip } = useTypewriter(text, cps)

  useEffect(() => {
    skipRef.current = () => {
      if (done) return false
      skip()
      return true
    }
  }, [done, skip, skipRef])

  return (
    <motion.div
      className={`dialog dialog--${variant}`}
      style={{ left: box.x, top: box.y, width: box.width, height: box.height }}
      initial={appear === 'b' ? { opacity: 0, y: 120 } : { opacity: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: appear === 'b' ? 0.6 : 0.8, delay: 0.4, ease: 'easeOut' }}
    >
      <div className="dialog__name">{speaker}</div>

      {/* Для программ чтения с экрана — реплика целиком, без печати по буквам */}
      <p className="sr-only" aria-live="polite">
        {speaker}: {text}
      </p>

      <p className="dialog__text" aria-hidden="true">
        {shown}
        {/* Остаток невидим, но занимает место — строки не прыгают при печати */}
        <span className="dialog__rest">{rest}</span>
      </p>

      {choices && done && (
        <div className="dialog__choices">
          {choices.map((c, i) => (
            <motion.button
              key={c}
              className="dialog__choice"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              onClick={(e) => {
                e.stopPropagation()
                onChoose?.(i)
              }}
            >
              {c}
            </motion.button>
          ))}
        </div>
      )}

      {done && !choices && (
        <motion.div
          className="dialog__next"
          aria-hidden="true"
          animate={{ opacity: [0.25, 1, 0.25], y: [0, 6, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </motion.div>
  )
}
