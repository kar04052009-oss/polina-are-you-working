import { useCallback, useEffect, useState } from 'react'

// Печатает текст по буквам со скоростью cps знаков в секунду.
// skip() сразу показывает реплику целиком.
export function useTypewriter(text: string, cps: number) {
  // Счётчик привязан к тексту: у новой реплики он сразу ноль, без мелькания
  const [state, setState] = useState({ text, count: 0 })
  const count = state.text === text ? state.count : 0

  useEffect(() => {
    const start = performance.now()
    let frame = requestAnimationFrame(function tick(now) {
      const next = Math.min(text.length, Math.floor(((now - start) / 1000) * cps))
      setState((s) => (s.text === text && s.count >= next ? s : { text, count: next }))
      if (next < text.length) frame = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(frame)
  }, [text, cps])

  const skip = useCallback(() => setState({ text, count: text.length }), [text])
  const done = count >= text.length

  return { shown: text.slice(0, count), rest: text.slice(count), done, skip }
}
