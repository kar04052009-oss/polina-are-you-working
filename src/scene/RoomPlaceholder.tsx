import { box, layout } from './layout'

// Запасная комната на случай, если картинки нет: стена, пол и предметы плашками в своих зонах.
export function RoomPlaceholder() {
  const { width: W, height: H } = layout.canvas
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', fontFamily: 'var(--font-mono)' }}>
      <rect width={W} height={H} style={{ fill: '#3a3a3a' }} />
      <rect y={1100} width={W} height={H - 1100} style={{ fill: '#2b2b2b' }} />
      {layout.items.map((it) => (
        <g key={it.id}>
          <rect {...box(it)} rx={16} style={{ fill: it.kind === 'section' ? 'var(--ui-line)' : 'var(--ui-line-soft)' }} />
          <text x={it.x + it.width / 2} y={it.y + it.height / 2 + 12} textAnchor="middle" style={{ fill: 'var(--ui-text)', fontSize: 34 }}>
            {it.label}
          </text>
        </g>
      ))}
    </svg>
  )
}
