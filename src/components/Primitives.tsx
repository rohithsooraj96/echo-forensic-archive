import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'

type PanelProps = HTMLAttributes<HTMLElement> & { children: ReactNode; as?: 'section' | 'div' | 'article' }

export function Panel({ children, className = '', as: Tag = 'section', ...props }: PanelProps) {
  return <Tag {...props} className={cn('glass-panel', className)}>{children}</Tag>
}

export function Eyebrow({ children, tone = 'cyan' }: { children: ReactNode; tone?: 'cyan' | 'amber' | 'coral' | 'muted' }) {
  return <p className={cn('eyebrow', tone === 'amber' && 'text-amber', tone === 'coral' && 'text-coral', tone === 'muted' && 'text-muted')}>{children}</p>
}

export function Tag({ children, tone = 'cyan' }: { children: ReactNode; tone?: 'cyan' | 'amber' | 'coral' | 'muted' }) {
  return <span className={cn('tag', tone === 'amber' && 'tag-amber', tone === 'coral' && 'tag-coral', tone === 'muted' && 'tag-muted')}>{children}</span>
}

export function ActionButton({ children, className = '', variant = 'secondary', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) {
  return <button className={cn('action-button', `button-${variant}`, className)} {...props}>{children}</button>
}

export function Stat({ label, value, detail, tone = 'cyan' }: { label: string; value: ReactNode; detail?: ReactNode; tone?: 'cyan' | 'amber' | 'coral' }) {
  return <div className={cn('stat-block', `stat-${tone}`)}><span className="stat-label">{label}</span><strong>{value}</strong>{detail && <span className="stat-detail">{detail}</span>}</div>
}

export function SectionHeader({ kicker, title, description, action }: { kicker: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="section-header"><div><Eyebrow>{kicker}</Eyebrow><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</div>
}
