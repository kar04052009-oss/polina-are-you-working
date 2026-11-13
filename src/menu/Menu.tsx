import { useEffect, useState, type MouseEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Section } from '../content/script'
import { SECTION_PATHS, SECTION_TITLES, openSection } from '../router/routes'
import './Menu.css'

// Разделы и их клавиши. Ctrl+цифры браузер оставляет себе (вкладки), поэтому просто цифры.
const SECTIONS: [Section, string][] = [
  ['портфолио', '1'],
  ['обо мне', '2'],
  ['контакты', '3'],
]

// Кнопка «Меню» в правом верхнем углу с выпадающим списком, как меню программы (выбрано на этапе 5)
export function Menu({ onRestart }: { onRestart: () => void }) {
  const [open, setOpen] = useState(false)

  // Горячие клавиши: 1, 2, 3 — разделы, Ctrl+Z — начать сначала
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea, [contenteditable]')) return
      // По физической клавише Z — работает и в русской раскладке (там это «Я»)
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ') {
        e.preventDefault()
        setOpen(false)
        onRestart()
        return
      }
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return
      const found = SECTIONS.find(([, key]) => key === e.key)
      if (found) {
        setOpen(false)
        openSection(found[0])
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onRestart])

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
        className={`menu__toggle ${open ? 'is-open' : ''}`}
        aria-expanded={open}
        onClick={(e) => {
          release(e)
          setOpen((o) => !o)
        }}
      >
        Меню ▾
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="menu__list"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {SECTIONS.map(([s, key]) => (
              <a key={s} className="menu__item" href={SECTION_PATHS[s] + window.location.search} onClick={go(s)}>
                <span>{SECTION_TITLES[s]}</span>
                <span className="menu__key">{key}</span>
              </a>
            ))}
            <div className="menu__sep" />
            <button className="menu__item" onClick={restart}>
              <span>Начать сначала</span>
              <span className="menu__key">Ctrl+Z</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
