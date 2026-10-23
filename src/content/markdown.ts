import { parse } from 'yaml'
import { marked } from 'marked'

// Разбирает файл Markdown с шапкой между строками «---» (title, year и т. д.).
export function parseMarkdown<T = Record<string, unknown>>(raw: string) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  const data = (match ? parse(match[1]) : {}) as T
  const body = match ? match[2] : raw
  return { data, html: marked.parse(body, { async: false }) }
}
