import type { ArchiveData, FilterState, WorldId } from '../data/types'

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(Math.round(value))
}

export function formatINR(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
}

export function visibleTraceCount(data: ArchiveData, filters: FilterState, entropy = 0) {
  if (filters.dataset === 'india' || filters.duplicateOnly) {
    const base = filters.duplicateOnly ? data.story.india.duplicateExtras : data.story.india.rows
    return Math.round(base - (base - data.story.india.uniquePatterns) * entropy)
  }
  if (filters.dataset === 'spotify' || filters.hour !== null) {
    if (filters.hour !== null) return data.spotifyHourly[filters.hour]?.events ?? 0
    return data.story.spotify.rows
  }
  if (filters.dataset === 'household' || filters.type !== 'all' || filters.category !== 'all') {
    if (filters.type !== 'all') {
      return filters.type === 'Expense' ? 2176 : filters.type === 'Income' ? 125 : 160
    }
    if (filters.category !== 'all') return data.householdCategories.find((item) => item.category === filters.category)?.events ?? 0
    return data.story.household.rows
  }
  return data.story.spotify.rows + data.story.household.rows + data.story.india.rows
}

export function activeRange(data: ArchiveData, world: WorldId, filters: FilterState) {
  if (filters.hour !== null) return `${String(filters.hour).padStart(2, '0')}:00 → hour trace`
  if (filters.year !== 'all') return `${filters.year} / indexed slice`
  if (world === 'listening') return `${data.manifest.sources.spotify.dateRange[0].slice(0, 10)} → ${data.manifest.sources.spotify.dateRange[1].slice(0, 10)}`
  if (world === 'spending') return `${data.manifest.sources.household.dateRange[0]} → ${data.manifest.sources.household.dateRange[1]}`
  if (world === 'transactions') return `${data.manifest.sources.india.dateRange[0].slice(0, 10)} → ${data.manifest.sources.india.dateRange[1].slice(0, 10)}`
  return 'three source lanes / descriptive alignment'
}

export function filteredSpotifyArtists(data: ArchiveData, query: string) {
  const needle = query.trim().toLowerCase()
  return data.spotifyArtists.filter((artist) => !needle || artist.label.toLowerCase().includes(needle))
}

export function filteredHouseholdCategories(data: ArchiveData, filters: FilterState) {
  return data.householdCategories.filter((item) => filters.category === 'all' || item.category === filters.category)
}

export function filteredIndiaPatterns(data: ArchiveData, filters: FilterState, entropy: number) {
  const score = entropy * 1
  return data.indiaDuplicates.groups.filter((group) => !filters.duplicateOnly || group.extras > 0).filter((group) => group.anomalyScore >= score).slice(0, 12)
}

export function matchedEntities(data: ArchiveData, query: string) {
  const needle = query.trim().toLowerCase()
  if (!needle) return [] as { label: string; detail: string; dataset: string }[]
  return [
    ...data.spotifyArtists.filter((item) => item.label.toLowerCase().includes(needle)).slice(0, 4).map((item) => ({ label: item.label, detail: `${formatNumber(item.value)} listening traces`, dataset: 'LISTENING' })),
    ...data.spotifyTracks.filter((item) => `${item.track} ${item.artist}`.toLowerCase().includes(needle)).slice(0, 4).map((item) => ({ label: item.track, detail: `${item.artist} · ${item.value} repeats`, dataset: 'LISTENING' })),
    ...data.householdCategories.filter((item) => item.category.toLowerCase().includes(needle)).slice(0, 4).map((item) => ({ label: item.category, detail: `${item.events} ledger records`, dataset: 'SPENDING' })),
    ...data.indiaGeo.merchants.filter((item) => item.label.toLowerCase().includes(needle)).slice(0, 4).map((item) => ({ label: item.label, detail: `${item.value} transaction traces`, dataset: 'TRANSACTIONS' })),
  ]
}
