import { layout, type Item } from './layout'
import { hitMask } from './cutouts'

function inPolygon(x: number, y: number, pts: [number, number][]) {
  let inside = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i]
    const [xj, yj] = pts[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

function inZone(i: Item, x: number, y: number) {
  return i.points ? inPolygon(x, y, i.points) : x >= i.x && x <= i.x + i.width && y >= i.y && y <= i.y + i.height
}

// Точнее всего — по вырезанной картинке предмета; если её нет — по зоне из разметки
function hits(i: Item, x: number, y: number) {
  return hitMask(i.id, x, y) ?? inZone(i, x, y)
}

const polina = layout.items.find((i) => i.id === 'polina')
const others = layout.items.filter((i) => i.id !== 'polina')

// Предмет под точкой холста (координаты в пикселях холста 3360×1600)
export function itemAt(x: number, y: number): Item | undefined {
  // Полина стоит перед предметами: по точному силуэту она проверяется первой,
  // а по грубой зоне — последней, чтобы не перекрывать мишек над плечом
  if (polina && hitMask('polina', x, y)) return polina
  const found = others.find((i) => hits(i, x, y))
  if (found) return found
  if (polina && hitMask('polina', x, y) === undefined && inZone(polina, x, y)) return polina
  return undefined
}
