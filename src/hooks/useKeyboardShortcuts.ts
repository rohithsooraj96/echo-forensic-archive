import { useEffect } from 'react'
import type { WorldId } from '../data/types'

interface ShortcutHandlers {
  setWorld: (world: WorldId) => void
  openPalette: () => void
  openCaseFile: () => void
  closePanels: () => void
  findConnection: () => void
}

export function useKeyboardShortcuts({ setWorld, openPalette, openCaseFile, closePanels, findConnection }: ShortcutHandlers) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement
      const editing = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openPalette(); return }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'e') { event.preventDefault(); openCaseFile(); return }
      if (event.key === 'Escape') { closePanels(); return }
      if (editing) return
      if (event.key === '1') setWorld('listening')
      if (event.key === '2') setWorld('spending')
      if (event.key === '3') setWorld('transactions')
      if (event.key === ' ') { event.preventDefault(); findConnection() }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [setWorld, openPalette, openCaseFile, closePanels, findConnection])
}
