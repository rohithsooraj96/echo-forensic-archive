import type { ArchiveData, Bookmark, FilterState, Manifest } from '../data/types'

function peakHour(points: { hour: number; events: number }[]) {
  return points.reduce((peak, point) => point.events > peak.events ? point : peak, points[0] ?? { hour: 0, events: 0 })
}

export function exportCaseFile(bookmarks: Bookmark[], filters: FilterState, manifest: Manifest, data?: ArchiveData, entropy = 0.42) {
  const payload = {
    title: 'ECHO / FORENSIC DOSSIER',
    version: manifest.version,
    exportedAt: new Date().toISOString(),
    filters,
    entropy: { value: entropy, percentage: Math.round(entropy * 100), label: 'duplicate collapse threshold' },
    bookmarks,
    circadianPeaks: data ? {
      spotify: peakHour(data.spotifyHourly),
      household: peakHour(data.householdHourly),
      india: peakHour(data.indiaHourly),
      interpretation: 'Cross-dataset hour alignment is descriptive only and does not establish a shared event.',
    } : null,
    sources: manifest.sources,
    metricDefinitions: {
      indiaDuplicateExtras: 'Exact full-row duplicate count minus one for each repeated pattern.',
      lateNightDensity: 'Spotify traces between 00:00 and 06:00 UTC divided by all Spotify traces.',
      analyticalAlignment: manifest.alignmentNote,
    },
    redaction: manifest.redaction,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `echo-dossier-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}
