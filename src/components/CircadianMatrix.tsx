import { useMemo, useState } from 'react'
import type { ArchiveData } from '../data/types'
import { ping } from '../lib/audio'
import { formatNumber } from '../lib/selectors'
import { AccessibleDataMirror } from './AccessibleDataMirror'
import { useResizeObserver } from '../hooks/useResizeObserver'
import { Eyebrow, Tag } from './Primitives'

interface Props {
  data: ArchiveData
  selectedHour: number | null
  onSelect: (hour: number) => void
}

function polar(cx: number, cy: number, radius: number, angle: number) {
  const radians = (angle - 90) * Math.PI / 180
  return { x: cx + radius * Math.cos(radians), y: cy + radius * Math.sin(radians) }
}

function arcPath(cx: number, cy: number, inner: number, outer: number, start: number, end: number) {
  const a = polar(cx, cy, outer, end)
  const b = polar(cx, cy, outer, start)
  const c = polar(cx, cy, inner, start)
  const d = polar(cx, cy, inner, end)
  const large = end - start > 180 ? 1 : 0
  return `M ${a.x} ${a.y} A ${outer} ${outer} 0 ${large} 0 ${b.x} ${b.y} L ${c.x} ${c.y} A ${inner} ${inner} 0 ${large} 1 ${d.x} ${d.y} Z`
}

function maxOf(values: number[]) { return Math.max(...values, 1) }

export function CircadianMatrix({ data, selectedHour, onSelect }: Props) {
  const [hoveredHour, setHoveredHour] = useState<number | null>(selectedHour)
  const hour = hoveredHour ?? selectedHour ?? 0
  const spotify = useMemo(() => data.spotifyHourly.map((item) => item.events), [data.spotifyHourly])
  const household = useMemo(() => data.householdHourly.map((item) => item.events), [data.householdHourly])
  const india = useMemo(() => data.indiaHourly.map((item) => item.events), [data.indiaHourly])
  const maxima = useMemo(() => ({ spotify: maxOf(spotify), household: maxOf(household), india: maxOf(india) }), [spotify, household, india])
  const colors = { spotify: '#5be4d6', household: '#f5be62', india: '#f07f6b' }
  const rings = [
    { key: 'spotify' as const, label: 'SPOTIFY / LISTENING', inner: 113, outer: 140, values: spotify },
    { key: 'household' as const, label: 'HOUSEHOLD / EXPENSES', inner: 84, outer: 107, values: household },
    { key: 'india' as const, label: 'INDIA / MERCHANT TRACES', inner: 55, outer: 78, values: india },
  ]
  const current = { spotify: spotify[hour] ?? 0, household: household[hour] ?? 0, india: india[hour] ?? 0 }
  const { ref: stageRef, size: stageSize } = useResizeObserver<HTMLDivElement>()

  function select(hourIndex: number) { setHoveredHour(hourIndex); onSelect(hourIndex); ping(440 + hourIndex * 8) }
  function keySelect(event: React.KeyboardEvent<SVGPathElement>, hourIndex: number) { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(hourIndex) } }

  return <div className="circadian-matrix" aria-label="Synchronized three-layer circadian matrix">
    <div className="matrix-copy"><div><Eyebrow>THE NIGHT / CROSS-LAYER SCRUB</Eyebrow><h3>Three rhythms, one clock.</h3><p>Hover or focus an hour to synchronize the same radial wedge across all source layers. Alignment is descriptive only.</p></div><Tag tone="muted">24-HOUR MATRIX</Tag></div>
    <div className="matrix-stage" ref={stageRef} data-render-width={Math.round(stageSize.width)} data-render-height={Math.round(stageSize.height)}><svg viewBox="0 0 360 360" role="img" aria-label={`Circadian matrix focused on ${String(hour).padStart(2, '0')}:00`}><circle cx="180" cy="180" r="145" fill="none" stroke="rgba(177,207,222,.11)" /><circle cx="180" cy="180" r="52" fill="rgba(6,10,16,.75)" stroke="rgba(177,207,222,.15)" />{rings.map((ring) => ring.values.map((value, index) => { const start = index * 15 + 1; const end = (index + 1) * 15 - 1; const active = hour === index; const opacity = .17 + (value / maxima[ring.key]) * .72; return <path key={`${ring.key}-${index}`} className={`matrix-wedge ${active ? 'active' : ''}`} d={arcPath(180, 180, ring.inner, ring.outer, start, end)} fill={colors[ring.key]} fillOpacity={active ? 1 : opacity} stroke={active ? '#f5f7f8' : '#071016'} strokeWidth={active ? 1.2 : .8} tabIndex={0} role="button" aria-label={`${ring.label}, ${String(index).padStart(2, '0')}:00, ${formatNumber(value)} traces`} onMouseEnter={() => setHoveredHour(index)} onFocus={() => setHoveredHour(index)} onMouseLeave={() => setHoveredHour(null)} onClick={() => select(index)} onKeyDown={(event) => keySelect(event, index)} /> }))}<text x="180" y="174" textAnchor="middle" className="matrix-center-label">{String(hour).padStart(2, '0')}:00</text><text x="180" y="191" textAnchor="middle" className="matrix-center-sub">SCRUBBED</text></svg><div className="matrix-readout" aria-live="polite"><span className="matrix-readout-hour">{String(hour).padStart(2, '0')}:00</span><div><b style={{ color: colors.spotify }}>{formatNumber(current.spotify)}</b><small>listening</small></div><div><b style={{ color: colors.household }}>{formatNumber(current.household)}</b><small>ledger</small></div><div><b style={{ color: colors.india }}>{formatNumber(current.india)}</b><small>merchant</small></div></div></div>
    <div className="matrix-legend">{rings.map((ring) => <span key={ring.key}><i style={{ background: colors[ring.key] }} /> {ring.label}</span>)}</div>
    <div className="matrix-hour-controls" aria-label="Select a shared hour" data-testid="circadian-hour-controls">{Array.from({ length: 24 }, (_, index) => <button key={index} className={hour === index ? 'active' : ''} data-testid={`circadian-hour-${index}`} onClick={() => select(index)} aria-label={`Focus ${String(index).padStart(2, '0')}:00`}>{String(index).padStart(2, '0')}</button>)}</div>
    <AccessibleDataMirror data={data} selectedHour={selectedHour} context="circadian" />
  </div>
}
