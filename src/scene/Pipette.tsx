import { useEffect, useRef, useState } from 'react'
import { layout } from './layout'
import { roomImage } from './assets'
import { itemAt } from './hitTest'
import './Pipette.css'

const room = layout.room

// Над окнами, меню и кнопками — обычный курсор, пипетка прячется
const UI = '.dialog, .menu, .section-backdrop, .room__readout'

// Есть ли у устройства мышь (на планшетах и телефонах курсора нет)
export const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches

// Цвета комнаты, уменьшенной в 4 раза, — для пипетки этого хватает
function useRoomPixels() {
  const ref = useRef<{ data: Uint8ClampedArray; w: number; h: number } | null>(null)
  useEffect(() => {
    if (!roomImage) return
    const img = new Image()
    img.onload = () => {
      const w = Math.round(room.width / 4)
      const h = Math.round(room.height / 4)
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const ctx = c.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)
      ref.current = { data: ctx.getImageData(0, 0, w, h).data, w, h }
    }
    img.src = roomImage
  }, [])

  return (cx: number, cy: number): string | null => {
    const px = ref.current
    if (!px) return null
    const x = Math.floor(((cx - room.x) / room.width) * px.w)
    const y = Math.floor(((cy - room.y) / room.height) * px.h)
    if (x < 0 || y < 0 || x >= px.w || y >= px.h) return layout.room.edgeColor.toUpperCase()
    const i = (y * px.w + x) * 4
    return '#' + [px.data[i], px.data[i + 1], px.data[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase()
  }
}

type Props = { scale: number; left: number; top: number }

// Курсор-пипетка: кружок с цветом комнаты под курсором и его код; над предметами — подпись
export function Pipette({ scale, left, top }: Props) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const sample = useRoomPixels()

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
  const cx = (pos.x - left) / scale
  const cy = (pos.y - top) / scale
  const color = sample(cx, cy)
  const item = itemAt(cx, cy)

  return (
    <div className="pipette" style={{ left: pos.x, top: pos.y }} aria-hidden="true">
      <svg className="pipette__icon" width="24" height="24" viewBox="0 0 24 24">
        <path
          d="M3 21l1.5-4.5L14 7l3 3-9.5 9.5z M14 7l2-2a2.1 2.1 0 0 1 3 3l-2 2"
          fill="#1e1e1e"
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      {(color || item) && (
        <span className="pipette__tag">
          {color && <span className="pipette__dot" style={{ background: color }} />}
          {item && (
            <b className="pipette__name">
              {item.label}
              {item.kind === 'section' && <em> · {item.goal}</em>}
            </b>
          )}
          {color}
        </span>
      )}
    </div>
  )
}
