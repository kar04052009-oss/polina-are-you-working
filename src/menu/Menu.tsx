import { useState, type MouseEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Section } from '../content/script'
import { SECTION_PATHS, SECTION_TITLES, openSection } from '../router/routes'
import './Menu.css'

const SECTIONS: Section[] = ['портфолио', 'обо мне', 'контакты']

// Кнопка «Меню» в правом верхнем углу с выпадающим списком (выбрано на этапе 5)
export function Menu({ onRestart }: { onRestart: () => void }) {
  const [open, setOpen] = useState(false)

  // После щелчка мышью кнопка отпускает фокус, иначе Enter нажимал бы её снова вместо того, чтобы листать диалог.
  // При управлении с клавиатуры (detail = 0) фокус остаётся.
  const release = (e: MouseEvent) => {
    if (e.detail > 0) (e.currentTarget as HTMLElement).blur()
  }

  // Разделы — настоящие ссылки: их можно открыть в новой вкладке или скопировать
  const go = (section: Section) => (e: MouseEvent) => {
    e.stopPropagation()
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    release(e)
    setOpen(false)
    openSection(section)
  }
  const restart = (e: MouseEvent) => {
    e.stopPropagation()
    release(e)
    setOpen(false)
    onRestart()
  }

  return (
    <nav className="menu" aria-label="Меню" onClick={(e) => e.stopPropagation()}>
      <button
        className="menu__toggle"
        aria-expanded={open}
        onClick={(e) => {
          release(e)
          setOpen((o) => !o)
        }}
      >
        Меню
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="menu__list"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {SECTIONS.map((s) => (
              <a key={s} className="menu__item" href={SECTION_PATHS[s] + window.location.search} onClick={go(s)}>
                {SECTION_TITLES[s]}
              </a>
            ))}
            <button className="menu__item" onClick={restart}>
              Начать сначала
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
