import type { ArchiveData, FilterState } from '../data/types'
import { ALIGNMENT_NOTE } from '../data/types'
import { activeRange, formatNumber, visibleTraceCount } from '../lib/selectors'

interface Props {
  data: ArchiveData
  filters?: FilterState
  entropy?: number
  selectedHour?: number | null
  context: 'archive' | 'circadian' | 'connections' | 'anomaly'
}

export function AccessibleDataMirror({ data, filters, entropy = 0.42, selectedHour = null, context }: Props) {
  const fallbackFilters: FilterState = {
    dataset: 'all', year: 'all', query: '', hour: selectedHour, category: 'all', type: 'all', duplicateOnly: false,
  }
  const effectiveFilters = filters ?? fallbackFilters
  const hour = selectedHour ?? effectiveFilters.hour
  const hourLabel = hour === null ? 'all hours' : `${String(hour).padStart(2, '0')}:00`
  const visible = visibleTraceCount(data, effectiveFilters, entropy)
  const range = activeRange(data, context === 'circadian' ? 'listening' : context === 'anomaly' ? 'transactions' : 'overview', effectiveFilters)

  return <div className="sr-only" aria-live="polite" role="status" data-testid={`${context}-data-mirror`}>
    <p>ECHO accessible data mirror: {formatNumber(data.story.spotify.rows)} Spotify listening traces; {formatNumber(data.story.household.rows)} household ledger records; {formatNumber(data.story.india.rows)} India transaction traces.</p>
    <p>Late-night density: {data.story.spotify.nightShare}% of listening traces occur between 00:00 and 06:00 UTC. Cross-dataset comparisons are descriptive only.</p>
    <p>Duplicate anomaly collapse: {formatNumber(data.story.india.rows)} supplied India rows collapse into {formatNumber(data.story.india.uniquePatterns)} unique full-row patterns, with {data.story.india.duplicateShare}% duplicate extras.</p>
    <p>Current context: {context}; active range {range}; {formatNumber(visible)} visible traces; selected hour {hourLabel}; entropy collapse threshold {Math.round(entropy * 100)}%.</p>
    <p>{ALIGNMENT_NOTE}. Shared temporal density detected. Analytical alignment only — non-causal data framing enforced.</p>
  </div>
}
