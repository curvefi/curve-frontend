import { useCallback, useEffect } from 'react'
import { getPageWidthClassName, useLayoutStore } from '@ui-kit/features/layout'

export const useLayoutStoreResponsive = () => {
  const { document } = typeof window === 'undefined' ? {} : window
  const setLayoutWidth = useLayoutStore(state => state.setLayoutWidth)
  const setPageVisible = useLayoutStore(state => state.setPageVisible)

  const handleResizeListener = useCallback(() => {
    if (window?.innerWidth) setLayoutWidth(getPageWidthClassName(window.innerWidth))
  }, [setLayoutWidth])

  useEffect(() => {
    if (!window || !document) return
    const handleVisibilityChange = () => setPageVisible(!document.hidden)

    handleResizeListener()
    handleVisibilityChange()

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('resize', handleResizeListener)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('resize', handleResizeListener)
    }
  }, [document, handleResizeListener, setPageVisible])
}
