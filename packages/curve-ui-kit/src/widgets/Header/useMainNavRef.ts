import { useEffect, useRef } from 'react'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useResizeObserver } from '@ui-kit/hooks/useResizeObserver'

export function useMainNavRef() {
  const ref = useRef<HTMLDivElement>(null)
  const setLayoutHeight = useLayoutStore((state) => state.setNavHeight)
  // Use border-box so navHeight includes the DesktopHeader bottom border.
  const [, height] = useResizeObserver(ref, { box: 'border' }) ?? []

  useEffect(() => {
    if (height != null) setLayoutHeight(height)
  }, [height, setLayoutHeight])

  return ref
}
