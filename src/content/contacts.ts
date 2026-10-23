import { parse } from 'yaml'
import contactsRaw from '../../content/contacts.yaml?raw'

export type ContactLink = { title: string; url: string }

export const contacts: ContactLink[] = (parse(contactsRaw)?.links ?? []) as ContactLink[]
