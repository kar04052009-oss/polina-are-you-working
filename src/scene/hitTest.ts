import { layout, type Item } from './layout'

function inPolygon(x: number, y: number, pts: [number, number][]) {
  let inside = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i]
    const [xj, yj] = pts[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

// Полина проверяется последней: предметы перед ней (и мишки над её плечом) важнее
const ordered = [...layout.items].sort((a, b) => Number(a.id === 'polina') - Number(b.id === 'polina'))

// Предмет под точкой холста (координаты в пикселях холста 3360×1600)
export function itemAt(x: number, y: number): Item | undefined {
  return ordered.find((i) =>
    i.points ? inPolygon(x, y, i.points) : x >= i.x && x <= i.x + i.width && y >= i.y && y <= i.y + i.height,
  )
}
