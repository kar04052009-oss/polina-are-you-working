import { useState, type MouseEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Section } from '../content/script'
import { SECTION_PATHS, SECTION_TITLES, openSection } from '../router/routes'
import './Menu.css'

// Временный выбор вида меню на этапе 5: ?menu=a|b|c. После выбора лишнее уберём.
const variant = (['a', 'b', 'c'] as const).find((v) => v === new URLSearchParams(window.location.search).get('menu')) ?? 'a'

const SECTIONS: Section[] = ['портфолио', 'обо мне', 'контакты']

// Простые значки-заглушки для варианта C
const ICONS: Record<Section | 'restart', ReactNode> = {
  портфолио: <path d="M3 7h6l2 2h10v10H3z" />,
  'обо мне': (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1-5 5-7 8-7s7 2 8 7" />
    </>
  ),
  контакты: (
    <>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </>
  ),
  restart: <path d="M4 12a8 8 0 1 0 3-6.2M4 4v5h5" />,
}

function Icon({ name }: { name: Section | 'restart' }) {
  return (
    <svg className="menu__icon" viewBox="0 0 24 24" aria-hidden="true">
      {ICONS[name]}
    </svg>
  )
}

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

  const items = (
    <>
      {SECTIONS.map((s) => (
        <a key={s} className="menu__item" href={SECTION_PATHS[s] + window.location.search} onClick={go(s)}>
          {variant === 'c' && <Icon name={s} />}
          <span className="menu__label">{SECTION_TITLES[s]}</span>
        </a>
      ))}
      <button className="menu__item" onClick={restart}>
        {variant === 'c' && <Icon name="restart" />}
        <span className="menu__label">Начать сначала</span>
      </button>
    </>
  )

  if (variant === 'b') {
    return (
      <nav className="menu menu--b" aria-label="Меню" onClick={(e) => e.stopPropagation()}>
        <button className="menu__toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
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
              {items}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    )
  }

  return (
    <nav className={`menu menu--${variant}`} aria-label="Меню" onClick={(e) => e.stopPropagation()}>
      {items}
    </nav>
  )
}
