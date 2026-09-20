import type { ArchiveData } from '../data/types'
import { matchedEntities } from './selectors'

export const commandHints = [
  { label: 'show late night activity', detail: 'filter the 00:00–06:00 listening lane', action: 'night' },
  { label: 'show long sessions', detail: 'surface inactivity-bounded listening sessions', action: 'sessions' },
  { label: 'show recurring spending', detail: 'open repeated household subcategories', action: 'recurring' },
  { label: 'show duplicate transactions', detail: 'open the India anomaly engine', action: 'duplicates' },
  { label: 'show connections', detail: 'scan the analytical relationship graph', action: 'connections' },
]

export function searchArchive(data: ArchiveData, query: string) {
  const value = query.trim().toLowerCase()
  if (!value) return commandHints
  return [
    ...commandHints.filter((hint) => hint.label.includes(value)),
    ...matchedEntities(data, value).map((entity) => ({ label: entity.label, detail: `${entity.detail} · ${entity.dataset}`, action: entity.dataset.toLowerCase() })),
  ].slice(0, 10)
}
