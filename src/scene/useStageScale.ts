import { useEffect, useState } from 'react'
import { layout } from './layout'

// Основная зона всегда видна целиком; всё, что шире или выше, — запас холста.
function measure() {
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

export function useStageScale() {
  const [state, setState] = useState(measure)
  useEffect(() => {
    const update = () => setState(measure())
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return state
}
