import { Bookmark, Download, FileText, Trash2, X } from 'lucide-react'
import type { Bookmark as BookmarkType } from '../data/types'
import { ActionButton, Eyebrow } from './Primitives'

interface Props { open: boolean; bookmarks: BookmarkType[]; onClose: () => void; onRemove: (id: string) => void; onExport: () => void; onPrint: () => void }

export function CaseFileDrawer({ open, bookmarks, onClose, onRemove, onExport, onPrint }: Props) {
  if (!open) return null
  return <aside className="case-drawer" aria-label="Forensic case file"><div className="drawer-head"><div><Eyebrow>FIELD NOTES / SESSION</Eyebrow><h2>Case file</h2></div><button onClick={onClose} aria-label="Close case file"><X size={18} /></button></div><div className="drawer-body">{bookmarks.length === 0 ? <div className="drawer-empty"><Bookmark size={24} /><h3>No patterns bookmarked</h3><p>When a trace catches your attention, save it here for review.</p></div> : bookmarks.map((item) => <article className="bookmark-card" key={item.id}><div className="bookmark-kind"><span>{item.kind}</span><button onClick={() => onRemove(item.id)} aria-label={`Remove ${item.title}`}><Trash2 size={13} /></button></div><h3>{item.title}</h3><strong>{item.statistic}</strong><p>{item.explanation}</p><small>SOURCE / {item.source}</small></article>)}</div><div className="drawer-foot"><div className="drawer-actions"><ActionButton variant="primary" onClick={onExport} disabled={!bookmarks.length}><Download size={15} /> EXPORT DOSSIER</ActionButton><ActionButton variant="ghost" onClick={onPrint} disabled={!bookmarks.length}><FileText size={15} /> PRINT EVIDENCE</ActionButton></div><p><FileText size={12} /> JSON DOSSIER / PRINT-READY EVIDENCE / SENSITIVE FIELDS REDACTED</p></div></aside>
}
