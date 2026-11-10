import { useEffect, useState } from 'react'
import type { Section } from '../content/script'

// Прямые ссылки на разделы. Название раздела — как в сценарии.
export const SECTION_PATHS: Record<Section, string> = {
  портфолио: '/portfolio',
  'обо мне': '/obo-mne',
  контакты: '/kontakty',
}

export const SECTION_TITLES: Record<Section, string> = {
  портфолио: 'Портфолио',
  'обо мне': 'Обо мне',
  контакты: 'Контакты',
}

const SITE_TITLE = 'Полина, ты работаешь?'

export type Route = { section: Section | null; notFound: boolean }

function readRoute(): Route {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  if (path === '/') return { section: null, notFound: false }
  const found = (Object.entries(SECTION_PATHS) as [Section, string][]).find(([, p]) => p === path)
  return found ? { section: found[0], notFound: false } : { section: null, notFound: true }
}

const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())

// Переход без перезагрузки. Параметры адреса (?novyi, ?ekran…) сохраняются.
export function openSection(section: Section) {
  if (readRoute().section === section) return
  // fromRoom — раздел открыт из комнаты, поэтому «Закрыть» может просто шагнуть назад
  history.pushState({ fromRoom: true }, '', SECTION_PATHS[section] + window.location.search)
  notify()
}

export function closeSection() {
  if (history.state?.fromRoom) history.back()
  else {
    history.replaceState(null, '', '/' + window.location.search)
    notify()
  }
}

export function useRoute() {
  const [route, setRoute] = useState(readRoute)

  useEffect(() => {
    const update = () => setRoute(readRoute())
    listeners.add(update)
    window.addEventListener('popstate', update)
    return () => {
      listeners.delete(update)
      window.removeEventListener('popstate', update)
    }
  }, [])

  // Неизвестный адрес — сразу показываем комнату по адресу «/»
  useEffect(() => {
    if (route.notFound) history.replaceState(null, '', '/' + window.location.search)
  }, [route.notFound])

  useEffect(() => {
    document.title = route.section ? `${SECTION_TITLES[route.section]} — ${SITE_TITLE}` : SITE_TITLE
  }, [route.section])

  return route
}
