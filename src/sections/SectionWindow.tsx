import { useEffect } from 'react'
import { motion } from 'motion/react'
import type { Section } from '../content/script'
import { layout } from '../scene/layout'
import { SECTION_TITLES } from '../router/routes'
import { texts } from '../content/interface'
import './SectionWindow.css'

// Раздел открывается окном приложения поверх комнаты. Пока заглушка — настоящие разделы появятся на этапах 7–10.
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
      transition={{ duration: 0.2 }}
      onClick={(e) => {
        e.stopPropagation()
        onClose()
      }}
    >
      <motion.section
        className="section-window"
        role="dialog"
        aria-labelledby="section-title"
        style={{ left: m.x + 420, top: m.y + 160, width: m.width - 840, height: 880 }}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="section-window__bar">
          <span>{SECTION_TITLES[section]}</span>
          <button className="section-window__close" onClick={onClose} aria-label="Закрыть" autoFocus>
            ×
          </button>
        </div>
        <div className="section-window__body">
          <div className="section-window__crumbs">Полина › {SECTION_TITLES[section]}</div>
          <h1 id="section-title" className="section-window__title">
            {SECTION_TITLES[section]}
          </h1>
          <p className="section-window__text">{texts.soon(section)}</p>
        </div>
      </motion.section>
    </motion.div>
  )
}
