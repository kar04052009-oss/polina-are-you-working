import { AnimatePresence, motion } from 'motion/react'
import { layout } from './layout'
import { cutouts } from './cutouts'
import { polinaSprite } from './assets'

// Мягкий светлый ореол по контуру (размеры в пикселях холста)
const GLOW = 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 18px rgba(255, 255, 255, 0.55))'

const room = layout.room
const p = layout.polina
const box = layout.dialogBox
// Как у самой Полины: низ растворяется за окном диалога
const fadePolina = `linear-gradient(to bottom, black ${box.y + 40 - p.y}px, transparent ${box.y + box.height - 40 - p.y}px)`

// Подсветка предмета под курсором. Кладётся под Полину, поэтому то, что за ней, остаётся за ней.
export function Highlight({ id }: { id: string | null }) {
  return (
    <AnimatePresence>
      {id && (
        <motion.div
          key={id}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <Glow id={id} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Glow({ id }: { id: string }) {
  // Полина — по её собственному силуэту
  const sprite = id === 'polina' ? polinaSprite('neutral') : undefined
  if (sprite) {
    return (
      <img
        src={sprite}
        alt=""
        style={{ position: 'absolute', left: p.x, top: p.y, width: p.width, height: p.height, filter: GLOW, maskImage: fadePolina, WebkitMaskImage: fadePolina }}
      />
    )
  }

  // Вырезанный предмет — точно по контуру
  if (cutouts[id]) {
    return (
      <img
        src={cutouts[id]}
        alt=""
        style={{ position: 'absolute', left: room.x, top: room.y, width: room.width, height: room.height, filter: GLOW }}
      />
    )
  }

  // Запасной вариант, пока нет вырезки: мягкая обводка по зоне из разметки
  const item = layout.items.find((i) => i.id === id)
  if (!item) return null
  const { width: W, height: H } = layout.canvas
  const shape = item.points ? (
    <polygon points={item.points.map((pt) => pt.join(',')).join(' ')} />
  ) : (
    <rect x={item.x} y={item.y} width={item.width} height={item.height} rx={24} />
  )
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
      <g style={{ fill: 'rgba(255, 255, 255, 0.08)', stroke: 'rgba(255, 255, 255, 0.9)', strokeWidth: 5, filter: GLOW }}>{shape}</g>
    </svg>
  )
}
