import { box, layout, type Item } from './layout'

const c = {
  wall: 'var(--color-cream)',
  floor: 'var(--color-beige)',
  pink: 'var(--color-pink)',
  white: 'var(--color-white)',
  crimson: 'var(--color-crimson)',
  text: 'var(--color-text)',
}
const item = (id: string) => layout.items.find((i) => i.id === id) as Item

// Простая плоская комната в палитре. Предметы нарисованы точно в своих зонах из layout.json.
export function RoomPlaceholder() {
  const { width: W, height: H } = layout.canvas
  const monitor = item('monitor')
  const screen = layout.monitorScreen
  const board = item('moodboard')
  const phone = item('phone')
  const mug = item('mug')
  const pencils = item('pencils')
  const win = item('window')
  const plant = item('plant')
  const deskTop = monitor.y + monitor.height + 20

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      <rect width={W} height={H} style={{ fill: c.wall }} />
      <rect y={1100} width={W} height={H - 1100} style={{ fill: c.floor }} />

      <rect {...box(win)} rx={16} style={{ fill: c.white, stroke: c.floor, strokeWidth: 24 }} />
      <line x1={win.x + win.width / 2} y1={win.y} x2={win.x + win.width / 2} y2={win.y + win.height} style={{ stroke: c.floor, strokeWidth: 16 }} />

      <rect {...box(board)} rx={12} style={{ fill: c.floor }} />
      {[0, 1, 2].flatMap((col) =>
        [0, 1].map((row) => (
          <rect
            key={`${col}-${row}`}
            x={board.x + 40 + col * 170}
            y={board.y + 40 + row * 190}
            width={140}
            height={160}
            rx={8}
            transform={`rotate(${(col + row) % 2 ? 3 : -3} ${board.x + 110 + col * 170} ${board.y + 120 + row * 190})`}
            style={{ fill: (col + row) % 2 ? c.pink : c.white }}
          />
        )),
      )}

      <rect x={0} y={deskTop} width={1940} height={40} style={{ fill: c.crimson, opacity: 0.55 }} />
      <rect x={60} y={deskTop + 40} width={40} height={1160 - deskTop} style={{ fill: c.crimson, opacity: 0.45 }} />
      <rect x={1840} y={deskTop + 40} width={40} height={1160 - deskTop} style={{ fill: c.crimson, opacity: 0.45 }} />

      <rect x={monitor.x} y={monitor.y} width={monitor.width} height={380} rx={24} style={{ fill: c.text }} />
      <rect {...box(screen)} rx={8} style={{ fill: c.pink }} />
      <rect x={monitor.x + monitor.width / 2 - 30} y={monitor.y + 380} width={60} height={50} style={{ fill: c.text }} />
      <rect x={monitor.x + monitor.width / 2 - 110} y={monitor.y + 420} width={220} height={20} rx={10} style={{ fill: c.text }} />

      <rect {...box(phone)} rx={22} style={{ fill: c.text }} />
      <rect x={phone.x + 12} y={phone.y + 16} width={phone.width - 24} height={phone.height - 40} rx={10} style={{ fill: c.white }} />

      <rect x={mug.x} y={mug.y + 20} width={mug.width - 30} height={mug.height - 20} rx={14} style={{ fill: c.white, stroke: c.crimson, strokeWidth: 6 }} />
      <circle cx={mug.x + mug.width - 30} cy={mug.y + 80} r={26} style={{ fill: 'none', stroke: c.crimson, strokeWidth: 10 }} />

      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={pencils.x + 50 + i * 28} y={pencils.y + i * 12} width={18} height={140} rx={6} style={{ fill: i % 2 ? c.crimson : c.pink }} />
      ))}
      <rect x={pencils.x + 30} y={pencils.y + 90} width={140} height={110} rx={14} style={{ fill: c.white, stroke: c.floor, strokeWidth: 6 }} />

      <ellipse cx={plant.x + plant.width / 2} cy={plant.y + 170} rx={plant.width / 2} ry={170} style={{ fill: c.pink }} />
      <rect x={plant.x + 20} y={plant.y + 320} width={plant.width - 40} height={plant.height - 320} rx={16} style={{ fill: c.crimson, opacity: 0.8 }} />
    </svg>
  )
}
