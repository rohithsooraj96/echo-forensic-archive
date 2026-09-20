import { Command, Search, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ArchiveData, FilterState, WorldId } from '../data/types'
import { searchArchive } from '../lib/search'
import { ActionButton } from './Primitives'

interface Props { data: ArchiveData; open: boolean; filters: FilterState; onClose: () => void; onFilter: (filters: FilterState) => void; onWorld: (world: WorldId) => void; onConnections: () => void }

export function CommandPalette({ data, open, filters, onClose, onFilter, onWorld, onConnections }: Props) {
  const [query, setQuery] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const results = searchArchive(data, query)
  useEffect(() => { if (open) { setQuery(''); setTimeout(() => input.current?.focus(), 10) } }, [open])
  if (!open) return null
  function choose(action: string) {
    if (action === 'night') onFilter({ ...filters, dataset: 'spotify', hour: 2 })
    else if (action === 'sessions') { onWorld('listening'); onFilter({ ...filters, dataset: 'spotify' }) }
    else if (action === 'recurring') { onWorld('spending'); onFilter({ ...filters, dataset: 'household', category: 'subscription' }) }
    else if (action === 'duplicates') { onWorld('transactions'); onFilter({ ...filters, dataset: 'india', duplicateOnly: true }) }
    else if (action === 'connections') onConnections()
    else if (action === 'listening') onWorld('listening')
    else if (action === 'spending') onWorld('spending')
    else if (action === 'transactions') onWorld('transactions')
    onClose()
  }
  return <div className="modal-scrim" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="command-palette" role="dialog" aria-modal="true" aria-labelledby="command-title"><div className="palette-head"><div><span className="palette-icon"><Command size={16} /></span><div><p className="eyebrow">COMMAND INDEX</p><h2 id="command-title">Find in the archive</h2></div></div><button onClick={onClose} aria-label="Close command palette"><X size={18} /></button></div><label className="palette-input"><Search size={17} /><input ref={input} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search an artist, trace, command..." /><kbd>ESC</kbd></label><div className="palette-results" role="listbox" aria-label="Search results">{results.length ? results.map((result) => <button className="palette-result" key={`${result.label}-${result.action}`} onClick={() => choose(result.action)}><span className="result-icon"><Sparkles size={15} /></span><span><b>{result.label}</b><small>{result.detail}</small></span><span className="result-arrow">↗</span></button>) : <p className="empty-state">NO MATCHES / TRY A DIFFERENT TRACE</p>}</div><div className="palette-footer"><span>TYPE TO SEARCH</span><span><kbd>↑↓</kbd> NAVIGATE <kbd>↵</kbd> SELECT</span><ActionButton variant="ghost" onClick={() => choose('connections')}>SCAN CONNECTIONS <Sparkles size={14} /></ActionButton></div></section></div>
}
