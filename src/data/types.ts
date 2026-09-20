export type DatasetId = 'all' | 'spotify' | 'household' | 'india'
export type WorldId = 'overview' | 'listening' | 'spending' | 'transactions'

export interface ManifestSource {
  rows: number
  dateRange: [string, string]
  fields: string[]
  exactUniquePatterns?: number
  duplicateExtras?: number
  redactedFields?: string[]
}

export interface Manifest {
  version: string
  generatedAt: string
  sources: Record<Exclude<DatasetId, 'all'>, ManifestSource>
  redaction: string
  alignmentNote: string
}

export interface MetricPoint {
  label: string
  value: number
  [key: string]: string | number | boolean
}

export interface SpotifyHourlyPoint {
  hour: number
  label: string
  events: number
  night: boolean
}
export interface SpotifyYearPoint {
  year: string
  events: number
  artists: number
  skipped: number
  skipRate: number
  hours: number
}
export interface SpotifyArtist { label: string; value: number }
export interface SpotifyTrack { track: string; artist: string; value: number }
export interface Session {
  start: string
  end: string
  events: number
  durationMinutes: number
  artists: SpotifyArtist[]
}
export interface SpotifySessions { count: number; longest: Session[]; overFourHours: number; overSixHours: number }

export interface HouseholdHourlyPoint { hour: number; label: string; events: number }
export interface IndiaHourlyPoint { hour: number; label: string; events: number }
export interface HouseholdMonth { month: string; events: number; expense: number; income: number; transfer: number }
export interface HouseholdCategory { category: string; events: number; amount: number; expense: number; income: number; transfer: number }
export interface HouseholdRecurring { label: string; events: number }

export interface IndiaPattern {
  patternId: string
  count: number
  extras: number
  completeness: number
  anomalyScore: number
  sample: { merchant: string; category: string; city: string; state: string; amt: string; is_fraud: string }
}
export interface IndiaDuplicateGroups {
  totalRows: number
  uniquePatterns: number
  duplicateExtras: number
  maxMultiplicity: number
  groups: IndiaPattern[]
}
export interface IndiaGeo { cities: SpotifyArtist[]; states: SpotifyArtist[]; merchants: SpotifyArtist[] }

export interface StoryStatistics {
  spotify: { rows: number; nightEvents: number; nightShare: number; skipped: number; skipRate: number; sessionCount: number; longestSessionMinutes: number; longestSessionEvents: number }
  household: { rows: number; expenses: number; income: number; subscriptions: number }
  india: { rows: number; uniquePatterns: number; duplicateExtras: number; duplicateShare: number; nonblankTransactionIds: number; uniqueNonblankTransactionIds: number }
}
export interface ConnectionNode { id: string; label: string; kind: string; datasets: string[]; description: string }

export interface ArchiveData {
  manifest: Manifest
  story: StoryStatistics
  spotifyHourly: SpotifyHourlyPoint[]
  spotifyYearly: SpotifyYearPoint[]
  spotifyArtists: SpotifyArtist[]
  spotifyTracks: SpotifyTrack[]
  spotifySessions: SpotifySessions
  householdHourly: HouseholdHourlyPoint[]
  indiaHourly: IndiaHourlyPoint[]
  householdMonthly: HouseholdMonth[]
  householdCategories: HouseholdCategory[]
  householdRecurring: HouseholdRecurring[]
  indiaMonthly: MetricPoint[]
  indiaCategories: SpotifyArtist[]
  indiaGeo: IndiaGeo
  indiaDuplicates: IndiaDuplicateGroups
  connections: ConnectionNode[]
}

export interface FilterState {
  dataset: DatasetId
  year: string
  query: string
  hour: number | null
  category: string
  type: 'all' | 'Expense' | 'Income' | 'Transfer-Out'
  duplicateOnly: boolean
}

export interface Bookmark {
  id: string
  title: string
  kind: string
  statistic: string
  explanation: string
  source: string
}

export const EMPTY_FILTERS: FilterState = {
  dataset: 'all', year: 'all', query: '', hour: null, category: 'all', type: 'all', duplicateOnly: false,
}

export const ALIGNMENT_NOTE = 'ANALYTICAL ALIGNMENT — NOT EVIDENCE OF A SHARED EVENT'
