import { box, layout } from './layout'

// Запасная комната на случай, если картинки нет: стена, пол и предметы плашками в своих зонах.
export function RoomPlaceholder() {
  const { width: W, height: H } = layout.canvas
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', fontFamily: 'var(--font-main)' }}>
      <rect width={W} height={H} style={{ fill: 'var(--color-cream)' }} />
      <rect y={1100} width={W} height={H - 1100} style={{ fill: 'var(--color-beige)' }} />
      {layout.items.map((it) => (
        <g key={it.id}>
          <rect {...box(it)} rx={16} style={{ fill: it.kind === 'section' ? 'var(--color-pink)' : 'var(--color-white)' }} />
          <text x={it.x + it.width / 2} y={it.y + it.height / 2 + 12} textAnchor="middle" style={{ fill: 'var(--color-text)', fontSize: 34 }}>
            {it.label}
          </text>
        </g>
      ))}
    </svg>
  )
}
