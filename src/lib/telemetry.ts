export type TelemetryEvent = 'view_open' | 'filter_change' | 'search' | 'shortcut' | 'case_export' | 'audio_toggle' | 'error'

export interface TelemetryRecord { type: TelemetryEvent; at: number; view: string }

const KEY = 'echo-session-telemetry'

export function logTelemetry(type: TelemetryEvent, view: string) {
  const previous = getTelemetry()
  const next = [...previous, { type, at: Date.now(), view }].slice(-80)
  try { sessionStorage.setItem(KEY, JSON.stringify(next)) } catch { /* privacy-first no-op */ }
  return next
}

export function getTelemetry(): TelemetryRecord[] {
  try {
    const value = sessionStorage.getItem(KEY)
    return value ? JSON.parse(value) as TelemetryRecord[] : []
  } catch { return [] }
}

export function clearTelemetry() {
  try { sessionStorage.removeItem(KEY) } catch { /* no-op */ }
}
