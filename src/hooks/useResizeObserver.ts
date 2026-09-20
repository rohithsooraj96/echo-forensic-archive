import { useCallback, useLayoutEffect, useState, type RefCallback } from 'react'

export interface ElementSize {
  width: number
  height: number
}

const EMPTY_SIZE: ElementSize = { width: 0, height: 0 }

function readSize(element: Element): ElementSize {
  const { width, height } = element.getBoundingClientRect()
  return { width: Math.round(width), height: Math.round(height) }
}

export function useResizeObserver<T extends Element>(): { ref: RefCallback<T>; size: ElementSize } {
  const [element, setElement] = useState<T | null>(null)
  const [size, setSize] = useState<ElementSize>(EMPTY_SIZE)
  const ref = useCallback<RefCallback<T>>((next) => setElement(next), [])

  useLayoutEffect(() => {
    if (!element) {
      setSize(EMPTY_SIZE)
      return
    }

    const update = (next: ElementSize) => {
      setSize((current) => current.width === next.width && current.height === next.height ? current : next)
    }

    update(readSize(element))
    if (typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      const entry = entries[0]
      if (entry) update({ width: Math.round(entry.contentRect.width), height: Math.round(entry.contentRect.height) })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [element])

  return { ref, size }
}
