import { Filter, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react'
import type { ArchiveData, DatasetId, FilterState } from '../data/types'
import { ActionButton, Tag } from './Primitives'

interface Props { data: ArchiveData; filters: FilterState; onChange: (next: FilterState) => void; onOpenPalette: () => void }

export function FilterBar({ data, filters, onChange, onOpenPalette }: Props) {
  const categories = data.householdCategories.slice(0, 12).map((item) => item.category)
  const hasFilters = filters.dataset !== 'all' || filters.year !== 'all' || filters.query || filters.hour !== null || filters.category !== 'all' || filters.type !== 'all' || filters.duplicateOnly
  const set = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch })
  return <section className="filter-bar" aria-label="Global archive filters">
    <div className="filter-topline"><div className="filter-label"><Filter size={15} /> TRACE FILTERS</div><button className="palette-hint" onClick={onOpenPalette}><span>COMMAND SEARCH</span><kbd>⌘ K</kbd></button><ActionButton className="reset-button" variant="ghost" onClick={() => onChange({ dataset: 'all', year: 'all', query: '', hour: null, category: 'all', type: 'all', duplicateOnly: false })}><RotateCcw size={13} /> RESET FILTERS</ActionButton></div>
    <div className="filter-controls">
      <label className="search-field"><Search size={16} /><input value={filters.query} onChange={(event) => set({ query: event.target.value })} placeholder="Search traces, artists, merchants..." aria-label="Search archive traces" /><button className="search-open" onClick={onOpenPalette} aria-label="Open command search">↗</button></label>
      <label className="select-field"><span>DATASET</span><select value={filters.dataset} onChange={(event) => set({ dataset: event.target.value as DatasetId })}><option value="all">ALL WORLDS</option><option value="spotify">LISTENING</option><option value="household">SPENDING</option><option value="india">TRANSACTIONS</option></select></label>
      <label className="select-field"><span>YEAR</span><select value={filters.year} onChange={(event) => set({ year: event.target.value })}><option value="all">ALL YEARS</option>{data.spotifyYearly.map((item) => <option value={item.year} key={item.year}>{item.year}</option>)}</select></label>
      <label className="select-field"><span>TYPE</span><select value={filters.type} onChange={(event) => set({ type: event.target.value as FilterState['type'] })}><option value="all">ALL TYPES</option><option value="Expense">EXPENSE</option><option value="Income">INCOME</option><option value="Transfer-Out">TRANSFER-OUT</option></select></label>
      <label className="select-field category-select"><span>CATEGORY</span><select value={filters.category} onChange={(event) => set({ category: event.target.value })}><option value="all">ALL CATEGORIES</option>{categories.map((category) => <option value={category} key={category}>{category.toUpperCase()}</option>)}</select></label>
      <button className={`toggle-filter ${filters.duplicateOnly ? 'is-on' : ''}`} onClick={() => set({ duplicateOnly: !filters.duplicateOnly })}><SlidersHorizontal size={14} /> DUPLICATE ONLY</button>
    </div>
    {hasFilters && <div className="active-filter-row"><span className="active-label">ACTIVE FILTERS</span>{filters.dataset !== 'all' && <Tag>{filters.dataset.toUpperCase()}</Tag>}{filters.year !== 'all' && <Tag>{filters.year}</Tag>}{filters.query && <Tag>{filters.query} <button onClick={() => set({ query: '' })} aria-label="Clear search"><X size={12} /></button></Tag>}{filters.hour !== null && <Tag>{String(filters.hour).padStart(2, '0')}:00</Tag>}{filters.duplicateOnly && <Tag tone="coral">DUPLICATES</Tag>}</div>}
  </section>
}
