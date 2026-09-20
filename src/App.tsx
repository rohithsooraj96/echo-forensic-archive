import { Component, type ErrorInfo, type ReactNode, useEffect, useState } from 'react'
import { AlertTriangle, LoaderCircle } from 'lucide-react'
import type { ArchiveData } from './data/types'
import { loadArchiveData, resetArchiveDataCache } from './data/loadArchiveData'
import { ArchiveShell } from './components/ArchiveShell'
import { Landing } from './components/Landing'

const sequence = ['INITIALIZING ARCHIVE...', 'INDEXING LISTENING TRACES...', 'INDEXING HOUSEHOLD RECORDS...', 'ANALYZING TRANSACTION STRUCTURE...', 'COLLAPSING DUPLICATES...', 'BUILDING CONNECTION GRAPH...', 'ARCHIVE READY']

function BootScreen({ label, progress }: { label: string; progress: number }) {
  return <main className="boot-screen" aria-live="polite" data-testid="archive-boot-screen"><div className="boot-mark">E</div><p className="eyebrow">ECHO / SYSTEM BOOT</p><h1>{label}</h1><div className="boot-track" aria-label={`Archive loading ${Math.round(progress)} percent`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}><i style={{ width: `${progress}%` }} /></div><div className="boot-meta"><span>LOCAL INDEX</span><span>{String(Math.round(progress)).padStart(3, '0')}%</span></div></main>
}

function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <main className="boot-screen error-screen" role="alert" data-testid="archive-load-error"><AlertTriangle size={28} /><p className="eyebrow">ARCHIVE ERROR</p><h1>Unable to read the local index.</h1><p>{message}</p><button className="action-button button-primary" data-testid="archive-retry" onClick={onRetry}><LoaderCircle size={15} /> RETRY INDEX LOAD</button><code>Prepared JSON is local-only. No network account is required.</code></main>
}

interface ErrorBoundaryProps { children: ReactNode; onRetry: () => void }
interface ErrorBoundaryState { error: Error | null }

class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ECHO render boundary caught an error', error, info.componentStack)
  }

  reset = () => {
    this.setState({ error: null })
    this.props.onRetry()
  }

  render() {
    if (this.state.error) return <LoadError message="The archive view encountered a rendering error. Retry to rebuild the local view." onRetry={this.reset} />
    return this.props.children
  }
}

export default function App() {
  const [data, setData] = useState<ArchiveData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [started, setStarted] = useState(false)
  const [boot, setBoot] = useState(0)
  const [loadAttempt, setLoadAttempt] = useState(0)

  useEffect(() => {
    let active = true
    setData(null)
    setError(null)
    loadArchiveData().then((next) => { if (active) setData(next) }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : 'Unknown archive error')
    })
    return () => { active = false }
  }, [loadAttempt])

  useEffect(() => {
    if (!started || !data) return
    let index = 0
    const timer = window.setInterval(() => { index += 1; setBoot(index); if (index >= sequence.length - 1) window.clearInterval(timer) }, 220)
    return () => window.clearInterval(timer)
  }, [started, data])

  const retry = () => {
    resetArchiveDataCache()
    setStarted(false)
    setBoot(0)
    setLoadAttempt((attempt) => attempt + 1)
  }

  if (error) return <LoadError message={error} onRetry={retry} />
  if (!data) return <BootScreen label="LOADING PREPARED INDEX..." progress={32} />
  if (!started) return <Landing story={data.story} householdRange={data.manifest.sources.household.dateRange} onBegin={() => { setStarted(true); setBoot(1) }} />
  if (boot < sequence.length - 1) return <BootScreen label={sequence[boot]} progress={Math.min(96, 8 + boot * 15)} />
  return <AppErrorBoundary onRetry={retry}><ArchiveShell data={data} /></AppErrorBoundary>
}

export { LoaderCircle }
