import raw from './layout.json'

// Все координаты — в пикселях холста 3360×1600.
export type Rect = { x: number; y: number; width: number; height: number }

export type Item = Rect & {
  id: string
  label: string
  goal: string
  kind: 'section' | 'easter'
  // Необязательный контур по точкам [[x, y], …] — когда предмет на картинке не прямоугольный.
  points?: [number, number][]
}

export type Layout = {
  canvas: { width: number; height: number }
  main: Rect
  // Где лежит картинка комнаты на холсте и каким цветом залить края за ней
  room: Rect & { edgeColor: string }
  dialog: Rect
  // Само окно внутри зоны диалога; верх ниже смартфона на столе
  dialogBox: Rect
  polina: Rect
  monitorScreen: Rect
  items: Item[]
}

export const layout = raw as Layout

// Только геометрия — чтобы передавать в <rect> без лишних полей.
export const box = ({ x, y, width, height }: Rect) => ({ x, y, width, height })
