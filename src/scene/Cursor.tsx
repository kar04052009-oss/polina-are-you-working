import { useEffect, useState } from 'react'
import { itemAt } from './hitTest'
import './Cursor.css'

// Над окнами, меню и кнопками — обычный курсор, свой прячется
const UI = '.dialog, .menu, .section-backdrop, .room__readout'

// Есть ли у устройства мышь (на планшетах и телефонах своего курсора нет)
export const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches

// Временный выбор формы курсора: ?kursor=a|b|c (искра / уголки выделения / кольцо). После выбора лишнее уберём.
const variant = (['a', 'b', 'c'] as const).find((v) => v === new URLSearchParams(window.location.search).get('kursor')) ?? 'a'

type Props = { scale: number; left: number; top: number }

// Курсор комнаты: необычная форма, над предметами — подпись (что это и куда ведёт)
export function Cursor({ scale, left, top }: Props) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest(UI)) setPos(null)
      else setPos({ x: e.clientX, y: e.clientY })
    }
    const onLeave = () => setPos(null)
    window.addEventListener('mousemove', onMove)
    document.documentElement.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  if (!pos) return null
  const item = itemAt((pos.x - left) / scale, (pos.y - top) / scale)

  return (
    <div className={`cursor cursor--${variant} ${item ? 'is-over' : ''}`} style={{ left: pos.x, top: pos.y }} aria-hidden="true">
      {variant === 'a' && (
        <svg className="cursor__spark" width="26" height="26" viewBox="-13 -13 26 26">
          <path d="M0-11 C1.2-3 3-1.2 11 0 C3 1.2 1.2 3 0 11 C-1.2 3-3 1.2-11 0 C-3-1.2-1.2-3 0-11Z" />
        </svg>
      )}
      {variant === 'b' && (
        <span className="cursor__corners">
          <i />
          <i />
          <i />
          <i />
          <b />
        </span>
      )}
      {variant === 'c' && (
        <span className="cursor__ring">
          <b />
        </span>
      )}
      {item && (
        <span className="cursor__label">
          {item.label}
          {item.kind === 'section' && <em> · {item.goal}</em>}
        </span>
      )}
    </div>
  )
}
