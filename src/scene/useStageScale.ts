import { useEffect, useState } from 'react'
import { layout, type Rect } from './layout'

export type View = { scale: number; left: number; top: number }

// Основная зона всегда видна целиком; всё, что шире или выше, — запас холста.
function fit(): View {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const { main } = layout
  const scale = Math.min(vw / main.width, vh / main.height)
  return {
    scale,
    left: (vw - main.width * scale) / 2 - main.x * scale,
    top: (vh - main.height * scale) / 2 - main.y * scale,
  }
}

// Камера вплотную к прямоугольнику холста (экран монитора): он целиком в окне, по центру
export function zoomTo(r: Rect, margin = 0.96): View {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const scale = Math.min(vw / r.width, vh / r.height) * margin
  return {
    scale,
    left: vw / 2 - (r.x + r.width / 2) * scale,
    top: vh / 2 - (r.y + r.height / 2) * scale,
  }
}

// Где прямоугольник холста окажется на экране при данном виде
export function onScreen(r: Rect, v: View) {
  return { left: v.left + r.x * v.scale, top: v.top + r.y * v.scale, width: r.width * v.scale, height: r.height * v.scale }
}

export function useStageScale() {
  const [state, setState] = useState(fit)
  // Размер окна — чтобы пересчитывать и приближение тоже
  const [, setSize] = useState(0)
  useEffect(() => {
    const update = () => {
      setState(fit())
      setSize((n) => n + 1)
    }
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return state
}
