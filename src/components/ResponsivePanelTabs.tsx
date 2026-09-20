import { Children, useId, useState, type KeyboardEvent, type ReactNode } from 'react'
import { cn } from './cn'

export interface ResponsiveTab {
  id: string
  label: string
}

interface Props {
  labels: readonly ResponsiveTab[]
  children: ReactNode
  ariaLabel: string
  testId: string
  className?: string
}

export function ResponsivePanelTabs({ labels, children, ariaLabel, testId, className }: Props) {
  const baseId = useId()
  const panels = Children.toArray(children)
  const [activeId, setActiveId] = useState(labels[0]?.id ?? '')
  const activeIndex = Math.max(0, labels.findIndex((item) => item.id === activeId))

  function focusTab(index: number) {
    const next = labels[(index + labels.length) % labels.length]
    if (!next) return
    setActiveId(next.id)
    document.getElementById(`${baseId}-tab-${next.id}`)?.focus()
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); focusTab(index + 1) }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); focusTab(index - 1) }
    if (event.key === 'Home') { event.preventDefault(); focusTab(0) }
    if (event.key === 'End') { event.preventDefault(); focusTab(labels.length - 1) }
  }

  return <section className={cn('responsive-panel-tabs', className)} data-testid={testId}>
    <div className="responsive-tablist" role="tablist" aria-label={ariaLabel}>
      {labels.map((item, index) => <button
        key={item.id}
        id={`${baseId}-tab-${item.id}`}
        className="responsive-tab"
        data-testid={`${testId}-tab-${item.id}`}
        role="tab"
        type="button"
        aria-selected={activeId === item.id}
        aria-controls={`${baseId}-panel-${item.id}`}
        tabIndex={activeId === item.id ? 0 : -1}
        onClick={() => setActiveId(item.id)}
        onKeyDown={(event) => onTabKeyDown(event, index)}
      >{item.label}</button>)}
    </div>
    <div className="responsive-panel-grid">
      {labels.map((item, index) => <div
        key={item.id}
        id={`${baseId}-panel-${item.id}`}
        className="responsive-panel-slot"
        data-testid={`${testId}-panel-${item.id}`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${item.id}`}
        hidden={index !== activeIndex}
      >{panels[index] ?? null}</div>)}
    </div>
  </section>
}
