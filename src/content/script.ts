import { parse } from 'yaml'

// Читает сценарий из main.yaml и проверяет его.
// Используется и на сайте, и при сборке (vite.config.ts) — ошибка в сценарии останавливает публикацию.

export const SECTIONS = ['портфолио', 'обо мне', 'контакты'] as const
export type Section = (typeof SECTIONS)[number]

// Пасхалка в сценарии → id предмета в src/scene/layout.json
export const EASTER_ITEMS: Record<string, string> = { кот: 'cat', кружки: 'mug' }

export type Answer = { text: string; next?: string; section?: Section }
export type Line =
  | { kind: 'line'; emotion?: string; text: string }
  | { kind: 'question'; emotion?: string; text: string; answers: Answer[] }

export type Script = {
  start: string
  returnStart: string
  scenes: Record<string, Line[]>
  easter: Record<string, Line[]>
}

export class ScriptError extends Error {}

const LINE_KEYS = ['эмоция', 'текст', 'вопрос', 'ответы']
const ANSWER_KEYS = ['текст', 'дальше', 'раздел']
const TOP_KEYS = ['начало', 'повторный визит', 'сцены', 'пасхалки']

type Raw = Record<string, unknown>
const isObject = (v: unknown): v is Raw => typeof v === 'object' && v !== null && !Array.isArray(v)
const isText = (v: unknown): v is string => typeof v === 'string' && v.trim() !== ''

export function parseScript(source: string): Script {
  const errors: string[] = []

  let raw: unknown
  try {
    raw = parse(source)
  } catch (e) {
    throw new ScriptError(`Не получается прочитать файл: ${(e as Error).message}`)
  }
  if (!isObject(raw)) throw new ScriptError('Файл пустой или устроен не так, как в образце.')

  for (const key of Object.keys(raw)) {
    if (!TOP_KEYS.includes(key)) errors.push(`Незнакомое слово «${key}». Возможные: ${TOP_KEYS.join(', ')}.`)
  }

  // Ссылки «дальше:» проверяются в конце, когда известны все сцены
  const refs: { where: string; next: string }[] = []

  const readLines = (where: string, list: unknown): Line[] => {
    if (!Array.isArray(list) || list.length === 0) {
      errors.push(`${where}: нет ни одной реплики.`)
      return []
    }
    return list.flatMap((item, i): Line[] => {
      const at = `${where}, реплика ${i + 1}`
      if (!isObject(item)) {
        errors.push(`${at}: реплика должна начинаться с «- » и содержать «текст:» или «вопрос:».`)
        return []
      }
      for (const key of Object.keys(item)) {
        if (!LINE_KEYS.includes(key)) errors.push(`${at}: незнакомое слово «${key}». Возможные: ${LINE_KEYS.join(', ')}.`)
      }
      const emotion = item['эмоция'] === undefined ? undefined : String(item['эмоция']).trim()

      if (item['вопрос'] !== undefined) {
        if (!isText(item['вопрос'])) errors.push(`${at}: вопрос пустой.`)
        if (item['текст'] !== undefined) errors.push(`${at}: у вопроса не нужно «текст:» — сам вопрос пишется после «вопрос:».`)
        const answers = item['ответы']
        if (!Array.isArray(answers) || answers.length === 0) {
          errors.push(`${at}: у вопроса нет ответов.`)
          return []
        }
        const parsed = answers.flatMap((a, j): Answer[] => {
          const aAt = `${at}, ответ ${j + 1}`
          if (!isObject(a)) {
            errors.push(`${aAt}: ответ должен содержать «текст:» и «дальше:» или «раздел:».`)
            return []
          }
          for (const key of Object.keys(a)) {
            if (!ANSWER_KEYS.includes(key)) errors.push(`${aAt}: незнакомое слово «${key}». Возможные: ${ANSWER_KEYS.join(', ')}.`)
          }
          if (!isText(a['текст'])) errors.push(`${aAt}: нет текста кнопки.`)
          const next = a['дальше']
          const section = a['раздел']
          if ((next === undefined) === (section === undefined)) {
            errors.push(`${aAt}: нужно ровно одно — «дальше:» или «раздел:».`)
          }
          if (section !== undefined && !SECTIONS.includes(section as Section)) {
            errors.push(`${aAt}: нет раздела «${section}». Возможные: ${SECTIONS.join(', ')}.`)
          }
          if (next !== undefined) refs.push({ where: `${at}, ответ «${a['текст']}»`, next: String(next) })
          return [{ text: String(a['текст'] ?? ''), next: next === undefined ? undefined : String(next), section: section as Section | undefined }]
        })
        return [{ kind: 'question', emotion, text: String(item['вопрос'] ?? ''), answers: parsed }]
      }

      if (item['ответы'] !== undefined) errors.push(`${at}: «ответы:» бывают только у реплики с «вопрос:».`)
      if (!isText(item['текст'])) {
        errors.push(`${at}: нет текста реплики.`)
        return []
      }
      return [{ kind: 'line', emotion, text: item['текст'] }]
    })
  }

  const scenes: Record<string, Line[]> = {}
  if (!isObject(raw['сцены'])) errors.push('Нет раздела «сцены:».')
  else for (const [name, list] of Object.entries(raw['сцены'])) scenes[name] = readLines(`Сцена «${name}»`, list)

  const easter: Record<string, Line[]> = {}
  if (raw['пасхалки'] !== undefined) {
    if (!isObject(raw['пасхалки'])) errors.push('«пасхалки:» устроены не так, как в образце.')
    else
      for (const [name, list] of Object.entries(raw['пасхалки'])) {
        if (!(name in EASTER_ITEMS)) errors.push(`Пасхалка «${name}»: такого предмета нет. Возможные: ${Object.keys(EASTER_ITEMS).join(', ')}.`)
        easter[name] = readLines(`Пасхалка «${name}»`, list)
      }
  }

  // Ссылки на сцены
  const sceneExists = (name: unknown, where: string) => {
    if (!isText(name)) errors.push(`${where}: не указано, с какой сцены начинать.`)
    else if (!(name in scenes)) errors.push(`${where}: нет сцены «${name}». Есть: ${Object.keys(scenes).join(', ')}.`)
  }
  sceneExists(raw['начало'], '«начало»')
  sceneExists(raw['повторный визит'], '«повторный визит»')
  for (const { where, next } of refs) {
    if (!(next in scenes)) errors.push(`${where}: нет сцены «${next}». Есть: ${Object.keys(scenes).join(', ')}.`)
  }

  if (errors.length) throw new ScriptError(`Ошибки в сценарии content/dialogues/main.yaml:\n- ${errors.join('\n- ')}`)

  return { start: String(raw['начало']), returnStart: String(raw['повторный визит']), scenes, easter }
}

// Все эмоции, которые встречаются в сценарии (для проверки, есть ли файлы спрайтов)
export function usedEmotions(script: Script): string[] {
  const all = [...Object.values(script.scenes), ...Object.values(script.easter)].flat()
  return [...new Set(all.map((l) => l.emotion).filter((e): e is string => !!e))]
}
