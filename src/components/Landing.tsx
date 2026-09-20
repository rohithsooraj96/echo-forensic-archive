import { ArrowUpRight, Database, Headphones, ScanLine, WalletCards } from 'lucide-react'
import { motion } from 'framer-motion'
import { initializeAudio, ping } from '../lib/audio'
import type { StoryStatistics } from '../data/types'
import { ActionButton, Eyebrow, Tag } from './Primitives'

interface LandingProps { story: StoryStatistics; householdRange: [string, string]; onBegin: () => void }

export function Landing({ story, householdRange, onBegin }: LandingProps) {
  const householdDates = householdRange.map((value) => value.slice(0, 10)).join(' — ')
  function begin() { initializeAudio(); ping(520); onBegin() }
  return <main className="landing-shell">
    <div className="landing-orbit orbit-one" /><div className="landing-orbit orbit-two" />
    <header className="landing-top"><span className="wordmark"><span className="wordmark-mark">E</span> ECHO</span><span className="mono-label">ARCHIVE / 01.0</span></header>
    <section className="landing-content">
      <div className="landing-copy">
        <Eyebrow>FORENSIC DATA ARCHIVE <span className="pulse-dot" /></Eyebrow>
        <h1>ECHO<span className="h1-dot">.</span></h1>
        <p className="landing-subtitle">THREE WORLDS. THOUSANDS OF TRACES. <em>HIDDEN PATTERNS.</em></p>
        <p className="landing-description">Explore the traces. Find the repetitions. Follow the connections.</p>
        <ActionButton variant="primary" className="begin-button" data-testid="begin-investigation" onClick={begin}><span>BEGIN INVESTIGATION</span><ArrowUpRight size={18} /></ActionButton>
        <div className="shortcut-line"><span><kbd>1</kbd> LISTENING</span><span><kbd>2</kbd> SPENDING</span><span><kbd>3</kbd> TRANSACTIONS</span><span><kbd>SPACE</kbd> SCAN</span></div>
      </div>
      <div className="archive-counter-grid" aria-label="Dataset counters">
        <div className="counter-card counter-spotify"><div className="counter-head"><Headphones size={18} /><Tag>LISTENING</Tag></div><strong>{story.spotify.rows.toLocaleString()}</strong><span>listening traces</span><small>2013 — 2024 / UTC</small></div>
        <div className="counter-card counter-household"><div className="counter-head"><WalletCards size={18} /><Tag tone="amber">SPENDING</Tag></div><strong>{story.household.rows.toLocaleString()}</strong><span>household records</span><small>{householdDates} / INR</small></div>
        <div className="counter-card counter-india"><div className="counter-head"><Database size={18} /><Tag tone="coral">TRANSACTIONS</Tag></div><strong>{story.india.rows.toLocaleString()}</strong><span>transaction traces</span><small>2022 — 2024 / STRUCTURE</small></div>
      </div>
    </section>
    <footer className="landing-footer"><span><ScanLine size={14} /> SYSTEM AWAITS INPUT</span><span className="mono-label">DESCRIPTIVE ONLY / NO SHARED IDENTITY ASSUMED</span></footer>
  </main>
}
