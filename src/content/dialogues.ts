import { parse } from 'yaml'
import mainRaw from '../../content/dialogues/main.yaml?raw'

export type Line = { speaker: string; emotion?: string; text: string }
export type Script = { greeting: Line[] }

export const mainScript = parse(mainRaw) as Script
