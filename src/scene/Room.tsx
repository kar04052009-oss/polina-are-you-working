import { useState } from 'react'
import { layout } from './layout'
import { roomImage } from './assets'
import { useStageScale } from './useStageScale'
import { RoomPlaceholder } from './RoomPlaceholder'
import { Polina } from './Polina'
import { MarkupOverlay } from './MarkupOverlay'
import './Room.css'

const showMarkup = new URLSearchParams(window.location.search).has('razmetka')

export function Room() {
  const { scale, left, top } = useStageScale()
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null)
  const { width: W, height: H } = layout.canvas
  const d = layout.dialog

  // Координаты курсора в пикселях холста — чтобы сверять зоны с картинкой.
  const onMove = (e: React.MouseEvent) => {
    if (!showMarkup) return
    setCursor({ x: Math.round((e.clientX - left) / scale), y: Math.round((e.clientY - top) / scale) })
  }

  return (
    <div className="room" onMouseMove={onMove}>
      <div
        className="room__stage"
        style={{ width: W, height: H, transform: `translate(${left}px, ${top}px) scale(${scale})` }}
      >
        {roomImage ? <img src={roomImage} alt="" width={W} height={H} className="room__bg" /> : <RoomPlaceholder />}
        <Polina />
        <div
          className="room__dialog-placeholder"
          style={{ left: d.x + 80, top: d.y + 30, width: d.width - 160, height: d.height - 60 }}
        />
        {showMarkup && <MarkupOverlay />}
      </div>

      {showMarkup && (
        <div className="room__readout">
          <div>Курсор на холсте: {cursor ? `x ${cursor.x}, y ${cursor.y}` : 'наведите на сцену'}</div>
          <div>
            Окно {window.innerWidth}×{window.innerHeight} · масштаб {Math.round(scale * 100)}%
          </div>
        </div>
      )}
    </div>
  )
}
