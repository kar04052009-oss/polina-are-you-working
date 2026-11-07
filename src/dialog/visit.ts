// Повторный визит: в браузере гостя хранится только отметка «уже был».
// Никуда не отправляется. ?novyi в адресе — показать сайт как в первый раз (для проверки).
const KEY = 'polina-visited'
const forceNew = new URLSearchParams(window.location.search).has('novyi')

export function isReturning(): boolean {
  if (forceNew) return false
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function rememberVisit() {
  if (forceNew) return
  try {
    localStorage.setItem(KEY, '1')
  } catch {
    // Браузер запретил хранение — просто каждый раз будет первый визит
  }
}
