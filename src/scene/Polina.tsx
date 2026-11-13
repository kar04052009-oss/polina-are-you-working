import { AnimatePresence, motion } from 'motion/react'
import { layout } from './layout'
import { polinaSprite } from './assets'

// Спрайт эмоции ставится в зону polina из layout.json.
// Низ спрайта плавно растворяется за диалоговым окном, и обрез фигуры не виден.
// Растворение привязано к окну, а не к размеру спрайта: Полину можно увеличивать, обрез всё равно спрячется.
const p = layout.polina
const box = layout.dialogBox
const fadeFrom = box.y + 40 - p.y
const fadeTo = box.y + box.height - 40 - p.y
const fadeBottom = `linear-gradient(to bottom, black ${fadeFrom}px, transparent ${fadeTo}px)`

export function Polina({ emotion = 'neutral' }: { emotion?: string }) {
  const { width: W, height: H } = layout.canvas
  // Если файла нужной эмоции ещё нет — показываем neutral
  const src = polinaSprite(emotion) ?? polinaSprite('neutral')

  if (src) {
    return (
      // Смена эмоции — быстрое растворение за 0,2 секунды (выбрано на этапе 4)
      <AnimatePresence initial={false}>
        <motion.img
          key={src}
          src={src}
          alt=""
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.width,
            height: p.height,
            maskImage: fadeBottom,
            WebkitMaskImage: fadeBottom,
          }}
        />
      </AnimatePresence>
    )
  }

  const cx = p.x + p.width / 2
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
      <circle cx={cx} cy={p.y + 170} r={150} style={{ fill: 'var(--ui-bar)', stroke: 'var(--ui-line)', strokeWidth: 8 }} />
      <rect x={p.x + 120} y={p.y + 340} width={p.width - 240} height={p.height - 340} rx={160} style={{ fill: 'var(--ui-bar)', stroke: 'var(--ui-line)', strokeWidth: 8 }} />
    </svg>
  )
}
