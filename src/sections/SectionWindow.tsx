import { useEffect } from 'react'
import { motion } from 'motion/react'
import type { Section } from '../content/script'
import { layout } from '../scene/layout'
import { SECTION_TITLES } from '../router/routes'
import './SectionWindow.css'

const SOON: Record<Section, string> = {
  портфолио: 'Скоро здесь будет рабочий стол с папками моих проектов.',
  'обо мне': 'Скоро здесь будет рассказ обо мне.',
  контакты: 'Скоро здесь будут ссылки, по которым меня можно найти.',
}

// Окно раздела поверх комнаты. Пока заглушка — настоящие разделы появятся на этапах 7–10.
export function SectionWindow({ section, onClose }: { section: Section; onClose: () => void }) {
  const { width: W, height: H } = layout.canvas
  const m = layout.main

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div
      className="section-backdrop"
      style={{ width: W, height: H }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={(e) => {
        e.stopPropagation()
        onClose()
      }}
    >
      <motion.section
        className="section-window"
        role="dialog"
        aria-labelledby="section-title"
        style={{ left: m.x + 480, top: m.y + 200, width: m.width - 960, height: 760 }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h1 id="section-title" className="section-window__title">
          {SECTION_TITLES[section]}
        </h1>
        <p className="section-window__text">{SOON[section]}</p>
        <button className="section-window__close" onClick={onClose} autoFocus>
          Закрыть
        </button>
      </motion.section>
    </motion.div>
  )
}
