import type { Bookmark, FilterState, Manifest } from '../data/types'

export function exportCaseFile(bookmarks: Bookmark[], filters: FilterState, manifest: Manifest) {
  const payload = {
    title: 'ECHO / FORENSIC CASE FILE',
    version: manifest.version,
    exportedAt: new Date().toISOString(),
    filters,
    bookmarks,
    sources: manifest.sources,
    metricDefinitions: {
      indiaDuplicateExtras: 'Exact full-row duplicate count minus one for each repeated pattern.',
      analyticalAlignment: manifest.alignmentNote,
    },
    redaction: manifest.redaction,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `echo-case-file-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}
