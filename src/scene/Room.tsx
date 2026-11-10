import { useState } from 'react'
import { layout } from './layout'
import { roomImage } from './assets'
import { useStageScale } from './useStageScale'
import { RoomPlaceholder } from './RoomPlaceholder'
import { Polina } from './Polina'
import { MarkupOverlay } from './MarkupOverlay'
import { AnimatePresence } from 'motion/react'
import { Dialog } from '../dialog/Dialog'
import { Menu } from '../menu/Menu'
import { SectionWindow } from '../sections/SectionWindow'
import { closeSection, openSection, useRoute } from '../router/routes'
import './Room.css'

const showMarkup = new URLSearchParams(window.location.search).has('razmetka')

export function Room() {
  const { scale, left, top } = useStageScale()
  const route = useRoute()
  const [emotion, setEmotion] = useState('neutral')
  // «Начать сначала» пересоздаёт диалог с первой реплики знакомства
  const [restarts, setRestarts] = useState(0)
  // Адрес с опечаткой запоминаем один раз — при первом открытии
  const [notFound] = useState(route.notFound)

  const restart = () => {
    if (route.section) closeSection()
    setEmotion('neutral')
    setRestarts((n) => n + 1)
  }
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null)
  const { width: W, height: H } = layout.canvas
  const room = layout.room

  // Координаты курсора в пикселях холста — чтобы сверять зоны с картинкой.
  const onMove = (e: React.MouseEvent) => {
    if (!showMarkup) return
    setCursor({ x: Math.round((e.clientX - left) / scale), y: Math.round((e.clientY - top) / scale) })
  }

  return (
    <div className="room" onMouseMove={onMove} style={roomImage ? { background: layout.room.edgeColor } : undefined}>
      <div
        className="room__stage"
        style={{ width: W, height: H, transform: `translate(${left}px, ${top}px) scale(${scale})` }}
      >
        {roomImage ? (
          <img src={roomImage} alt="" className="room__bg" style={{ left: room.x, top: room.y, width: room.width, height: room.height }} />
        ) : (
          <RoomPlaceholder />
        )}
        <Polina emotion={emotion} />
        <Dialog
          key={restarts}
          onEmotion={setEmotion}
          onSection={openSection}
          paused={route.section !== null}
          fromStart={restarts > 0}
          notFound={notFound && restarts === 0}
        />
        <AnimatePresence>
          {route.section && <SectionWindow key={route.section} section={route.section} onClose={closeSection} />}
        </AnimatePresence>
        {showMarkup && <MarkupOverlay />}
      </div>

      <Menu onRestart={restart} />

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
