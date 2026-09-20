import { Archive, Bookmark, Command, Info, Menu, PanelRight, Search, Sparkles, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useMemo, useState } from 'react'
import type { ArchiveData, Bookmark as BookmarkType, FilterState, WorldId } from '../data/types'
import { EMPTY_FILTERS } from '../data/types'
import { activeRange, visibleTraceCount } from '../lib/selectors'
import { exportCaseFile } from '../lib/exportCaseFile'
import { logTelemetry } from '../lib/telemetry'
import { connectionSweep, ping, setAudioMuted } from '../lib/audio'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { AccessibleDataMirror } from './AccessibleDataMirror'
import { AtmosphereCanvas } from './AtmosphereCanvas'
import { CaseFileDrawer } from './CaseFileDrawer'
import { CommandPalette } from './CommandPalette'
import { ConnectionGraph } from './ConnectionGraph'
import { FilterBar } from './FilterBar'
import { InvestigationPanel } from './InvestigationPanel'
import { ActionButton, Eyebrow, Tag } from './Primitives'
import { TelemetryBar } from './TelemetryBar'
import { WorldView } from './WorldView'
import { VisualizationErrorBoundary } from './VisualizationErrorBoundary'

interface Props { data: ArchiveData }

export function ArchiveShell({ data }: Props) {
  const [world, setWorld] = useState<WorldId>('overview')
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [entropy, setEntropy] = useState(0.42)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [caseOpen, setCaseOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [muted, setMuted] = useState(true)
  const [selectedNode, setSelectedNode] = useState<ArchiveData['connections'][number] | null>(null)
  const [flightNodeId, setFlightNodeId] = useState<string | null>(null)
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([])

  const indexed = data.story.spotify.rows + data.story.household.rows + data.story.india.rows
  const visible = visibleTraceCount(data, filters, entropy)
  const range = activeRange(data, world, filters)
  const title = world === 'overview' ? 'ARCHIVE OVERVIEW' : world === 'listening' ? 'LISTENING WORLD' : world === 'spending' ? 'SPENDING WORLD' : 'TRANSACTION WORLD'
  const navItems: { id: WorldId; number: string; label: string; marker: string }[] = [
    { id: 'overview', number: '0', label: 'OVERVIEW', marker: '◎' },
    { id: 'listening', number: '1', label: 'LISTENING', marker: '◉' },
    { id: 'spending', number: '2', label: 'SPENDING', marker: '◈' },
    { id: 'transactions', number: '3', label: 'TRANSACTIONS', marker: '◇' },
  ]

  const selectWorld = useCallback((next: WorldId) => { setWorld(next); logTelemetry('view_open', next); ping(next === 'transactions' ? 260 : 520) }, [])
  const openPalette = useCallback(() => { setPaletteOpen(true); logTelemetry('search', world) }, [world])
  const closePanels = useCallback(() => { setPaletteOpen(false); setCaseOpen(false); setHelpOpen(false); setSelectedNode(null) }, [])
  const findConnection = useCallback(() => { const node = data.connections[Math.floor(Math.random() * data.connections.length)]; if (!node) return; const destination = node.datasets[0] === 'spotify' ? 'listening' : node.datasets[0] === 'household' ? 'spending' : 'transactions'; setSelectedNode(null); setFlightNodeId(node.id); setWorld('overview'); logTelemetry('view_open', 'connection-flight'); connectionSweep(); window.setTimeout(() => { setFlightNodeId(null); setSelectedNode(node); setWorld(destination) }, 1150) }, [data.connections])
  const bookmark = useCallback((item: BookmarkType) => { setBookmarks((items) => items.some((existing) => existing.id === item.id) ? items : [...items, item]); setCaseOpen(true); logTelemetry('case_export', world); ping(740) }, [world])
  const updateFilters = useCallback((next: FilterState) => { setFilters(next); logTelemetry('filter_change', world) }, [world])
  const exportCurrent = useCallback(() => { exportCaseFile(bookmarks, filters, data.manifest, data, entropy); logTelemetry('case_export', world) }, [bookmarks, filters, data, entropy, world])

  useKeyboardShortcuts({ setWorld: selectWorld, openPalette, openCaseFile: () => setCaseOpen(true), closePanels, findConnection })
  const sourceStatus = useMemo(() => [{ label: 'SPOTIFY', rows: data.story.spotify.rows, color: 'cyan' }, { label: 'HOUSEHOLD', rows: data.story.household.rows, color: 'amber' }, { label: 'INDIA', rows: data.story.india.rows, color: 'coral' }] as const, [data])

  return <div className="archive-app"><VisualizationErrorBoundary name="Atmosphere"><AtmosphereCanvas /></VisualizationErrorBoundary><div className="crt-layer" aria-hidden="true" /><header className="archive-header"><div className="header-brand"><button className="mobile-menu" aria-label="Open navigation"><Menu size={18} /></button><button className="wordmark archive-wordmark" onClick={() => selectWorld('overview')}><span className="wordmark-mark">E</span> ECHO</button><span className="header-divider" /><span className="header-title">FORENSIC DATA ARCHIVE</span></div><div className="header-right"><span className="live-status"><span className="status-dot" /> LIVE INDEX</span><button className="header-search" data-testid="header-search" onClick={openPalette}><Search size={15} /><span>SEARCH ARCHIVE</span><kbd>⌘K</kbd></button><button className="case-trigger" data-testid="case-file-trigger" onClick={() => setCaseOpen(true)}><Bookmark size={15} /> CASE FILE <span>{bookmarks.length}</span></button></div></header><div className="archive-layout"><aside className="archive-sidebar"><div className="sidebar-label">ARCHIVE WORLDS</div><nav aria-label="Archive worlds">{navItems.map((item) => <button key={item.id} data-testid={`world-nav-${item.id}`} className={`nav-item ${world === item.id ? 'active' : ''}`} onClick={() => selectWorld(item.id)}><span className="nav-key">{item.number}</span><span className="nav-marker">{item.marker}</span><span>{item.label}</span>{world === item.id && <i />}</button>)}</nav><div className="sidebar-divider" /><div className="sidebar-label">SOURCE STATUS</div><div className="source-status-list">{sourceStatus.map((source) => <button className="source-status" key={source.label} onClick={() => selectWorld(source.label === 'SPOTIFY' ? 'listening' : source.label === 'HOUSEHOLD' ? 'spending' : 'transactions')}><span className={`source-dot ${source.color}`} /><span>{source.label}</span><b>{(source.rows / 1000).toFixed(source.rows > 10000 ? 1 : 2)}k</b></button>)}</div><div className="sidebar-bottom"><span>SESSION / LOCAL ONLY</span><span>v1.0.0</span></div></aside><main className="archive-main"><div className="mobile-title"><div><Eyebrow>ARCHIVE / {world.toUpperCase()}</Eyebrow><h1>{title}</h1></div><button onClick={() => setCaseOpen(true)} aria-label="Open case file"><Bookmark size={18} /></button></div><div className="main-toolbar"><div><Eyebrow>{world === 'overview' ? 'READ THE TRACE' : `WORLD 0${world === 'listening' ? '1' : world === 'spending' ? '2' : '3'} / LIVE INDEX`}</Eyebrow><h1>{title}</h1></div><div className="toolbar-actions"><Tag tone={world === 'transactions' ? 'coral' : world === 'spending' ? 'amber' : 'cyan'}>{world === 'overview' ? '3 SOURCE LANES' : 'INDEXED'}</Tag><ActionButton variant="ghost" data-testid="toolbar-find-connection" onClick={findConnection}><Sparkles size={14} /> FIND CONNECTION <span className="button-key">SPACE</span></ActionButton></div></div><FilterBar data={data} filters={filters} onChange={updateFilters} onOpenPalette={openPalette} /><motion.div className="world-content" key={world} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3 }}><VisualizationErrorBoundary name="World view"><WorldView data={data} world={world} filters={filters} entropy={entropy} onEntropy={setEntropy} onHour={(hour) => { setFilters((current) => ({ ...current, hour, dataset: 'spotify' })); selectWorld('listening') }} onWorld={selectWorld} onFind={findConnection} onBookmark={bookmark} /></VisualizationErrorBoundary>{world === 'overview' && <VisualizationErrorBoundary name="Connection graph"><ConnectionGraph data={data} nodes={data.connections} activeNodeId={flightNodeId} isFlying={Boolean(flightNodeId)} onSelect={(node) => setSelectedNode(node)} onFind={findConnection} /></VisualizationErrorBoundary>}</motion.div></main></div><TelemetryBar visible={visible} indexed={indexed} range={range} world={world} entropy={entropy} muted={muted} onMute={() => { setMuted((value) => { const next = !value; setAudioMuted(next); return next }); logTelemetry('audio_toggle', world) }} onHelp={() => setHelpOpen(true)} onExport={exportCurrent} /><AccessibleDataMirror data={data} filters={filters} entropy={entropy} context="archive" /><AnimatePresence>{selectedNode && <InvestigationPanel data={data} node={selectedNode} onClose={() => setSelectedNode(null)} />}</AnimatePresence><CommandPalette data={data} open={paletteOpen} filters={filters} onClose={() => setPaletteOpen(false)} onFilter={updateFilters} onWorld={selectWorld} onConnections={findConnection} /><CaseFileDrawer open={caseOpen} bookmarks={bookmarks} onClose={() => setCaseOpen(false)} onRemove={(id) => setBookmarks((items) => items.filter((item) => item.id !== id))} onExport={exportCurrent} onPrint={() => window.print()} />{helpOpen && <div className="modal-scrim" onMouseDown={(event) => { if (event.target === event.currentTarget) setHelpOpen(false) }}><section className="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title"><button className="modal-close" onClick={() => setHelpOpen(false)} aria-label="Close shortcuts"><X size={18} /></button><Eyebrow>CONTROL SURFACE</Eyebrow><h2 id="help-title">Keyboard shortcuts</h2><div className="shortcut-grid"><span><kbd>1</kbd> <b>LISTENING</b></span><span><kbd>2</kbd> <b>SPENDING</b></span><span><kbd>3</kbd> <b>TRANSACTIONS</b></span><span><kbd>SPACE</kbd> <b>FIND CONNECTION</b></span><span><kbd>⌘ K</kbd> <b>COMMAND PALETTE</b></span><span><kbd>⌘ E</kbd> <b>OPEN CASE FILE</b></span><span><kbd>ESC</kbd> <b>CLOSE PANELS</b></span></div><p><Info size={14} /> Shortcuts pause while you type into a field. All key actions have an equivalent button.</p></section></div>}</div>
}
