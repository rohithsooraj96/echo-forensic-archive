import { Activity, AudioLines, CircleHelp, Download, Keyboard, Radio, Volume2, VolumeX } from 'lucide-react'
import type { WorldId } from '../data/types'
import { formatNumber } from '../lib/selectors'

interface Props { visible: number; indexed: number; range: string; world: WorldId; entropy: number; muted: boolean; onMute: () => void; onHelp: () => void; onExport: () => void }

export function TelemetryBar({ visible, indexed, range, entropy, muted, onMute, onHelp, onExport }: Props) {
  return <footer className="telemetry-bar" aria-label="Forensic telemetry" data-testid="telemetry-bar">
    <div className="sr-only" aria-live="polite" data-testid="telemetry-live-mirror">ECHO live archive status: {formatNumber(indexed)} records indexed; {formatNumber(visible)} visible traces; active filter {range}; entropy index {Math.round(entropy * 100)} percent.</div>
    <div className="telemetry-status"><span className="status-dot" /> SYS_STATUS: ACTIVE</div>
    <div className="telemetry-item"><Radio size={13} /> RECORDS_INDEXED: <b>{formatNumber(indexed)}</b></div>
    <div className="telemetry-item telemetry-range"><Activity size={13} /> ACTIVE_FILTER: <b>{range}</b></div>
    <div className="telemetry-item"><span className="telemetry-key">VISIBLE_TRACES</span> <b>{formatNumber(visible)}</b></div>
    <div className="telemetry-item entropy-readout"><span>ENTROPY_INDEX</span> <b>{Math.round(entropy * 100).toString().padStart(2, '0')}</b></div>
    <div className="telemetry-actions"><button data-testid="audio-toggle" aria-label={muted ? 'Enable archive audio' : 'Mute archive audio'} aria-pressed={!muted} onClick={onMute}>{muted ? <VolumeX size={15} /> : <Volume2 size={15} />}</button><button data-testid="help-trigger" aria-label="Open keyboard shortcuts" onClick={onHelp}><Keyboard size={15} /></button><button data-testid="telemetry-export" aria-label="Export case file" onClick={onExport}><Download size={15} /></button><CircleHelp size={14} className="telemetry-help" /></div>
  </footer>
}
