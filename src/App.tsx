import { useEffect, useState } from 'react'
import { AlertTriangle, LoaderCircle } from 'lucide-react'
import type { ArchiveData } from './data/types'
import { loadArchiveData } from './data/loadArchiveData'
import { ArchiveShell } from './components/ArchiveShell'
import { Landing } from './components/Landing'

const sequence = ['INITIALIZING ARCHIVE...', 'INDEXING LISTENING TRACES...', 'INDEXING HOUSEHOLD RECORDS...', 'ANALYZING TRANSACTION STRUCTURE...', 'COLLAPSING DUPLICATES...', 'BUILDING CONNECTION GRAPH...', 'ARCHIVE READY']

function BootScreen({ label, progress }: { label: string; progress: number }) {
  return <main className="boot-screen"><div className="boot-mark">E</div><p className="eyebrow">ECHO / SYSTEM BOOT</p><h1>{label}</h1><div className="boot-track"><i style={{ width: `${progress}%` }} /></div><div className="boot-meta"><span>LOCAL INDEX</span><span>{String(Math.round(progress)).padStart(3, '0')}%</span></div></main>
}

export default function App() {
  const [data, setData] = useState<ArchiveData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [started, setStarted] = useState(false)
  const [boot, setBoot] = useState(0)
  useEffect(() => { loadArchiveData().then(setData).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unknown archive error')) }, [])
  useEffect(() => {
    if (!started || !data) return
    let index = 0
    const timer = window.setInterval(() => { index += 1; setBoot(index); if (index >= sequence.length - 1) window.clearInterval(timer) }, 220)
    return () => window.clearInterval(timer)
  }, [started, data])
  if (error) return <main className="boot-screen error-screen"><AlertTriangle size={28} /><p className="eyebrow">ARCHIVE ERROR</p><h1>Unable to read the local index.</h1><p>{error}</p><code>Run npm run prepare:data, then reload.</code></main>
  if (!data) return <BootScreen label="LOADING PREPARED INDEX..." progress={32} />
  if (!started) return <Landing story={data.story} householdRange={data.manifest.sources.household.dateRange} onBegin={() => { setStarted(true); setBoot(1) }} />
  if (boot < sequence.length - 1) return <BootScreen label={sequence[boot]} progress={Math.min(96, 8 + boot * 15)} />
  return <ArchiveShell data={data} />
}

export { LoaderCircle }
