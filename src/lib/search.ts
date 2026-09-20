import type { ArchiveData } from '../data/types'
import { matchedEntities } from './selectors'

export const commandHints = [
  { label: 'show late night activity', detail: 'filter the 00:00–06:00 listening lane', action: 'night' },
  { label: 'show long sessions', detail: 'surface inactivity-bounded listening sessions', action: 'sessions' },
  { label: 'show recurring spending', detail: 'open repeated household subcategories', action: 'recurring' },
  { label: 'show duplicate transactions', detail: 'open the India anomaly engine', action: 'duplicates' },
  { label: 'show connections', detail: 'scan the analytical relationship graph', action: 'connections' },
  { label: 'show 2023', detail: 'focus the 2023 indexed slice', action: 'year-2023' },
  { label: 'show source timezones', detail: 'compare UTC, unspecified local time, and India source timestamps', action: 'timezones' },
  { label: 'show transaction types', detail: 'inspect expense, income, and transfer-out records', action: 'transaction-types' },
]

function normalize(value: string) {
  return value.toLocaleLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()
}

function fuzzyMatch(candidate: string, query: string) {
  const text = normalize(candidate)
  return normalize(query).split(' ').filter(Boolean).every((term) => text.includes(term) || [...term].reduce((position, character) => {
    if (position < 0) return -1
    const next = text.indexOf(character, position)
    return next < 0 ? -1 : next + 1
  }, 0) >= 0)
}

export function searchArchive(data: ArchiveData, query: string) {
  const value = query.trim()
  if (!value) return commandHints
  return [
    ...commandHints.filter((hint) => fuzzyMatch(hint.label, value)),
    ...matchedEntities(data, value).map((entity) => ({ label: entity.label, detail: `${entity.detail} · ${entity.dataset}`, action: entity.action ?? entity.dataset.toLowerCase() })),
  ].slice(0, 10)
}
