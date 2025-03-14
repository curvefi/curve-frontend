import { useEffect, useState } from 'react'

/** Detects if the current device is a mobile device based on touch capabilities */
function detectIsMobile() {
  let hasTouchScreen

  if ('maxTouchPoints' in navigator) {
    hasTouchScreen = navigator.maxTouchPoints > 0
  } else if ('msMaxTouchPoints' in navigator) {
    // @ts-ignore
    hasTouchScreen = navigator.msMaxTouchPoints > 0
  } else {
    const mQ = matchMedia?.('(pointer:coarse)')
    if (mQ?.media === '(pointer:coarse)') {
      // @ts-ignore
      hasTouchScreen = mQ.matches
    } else if ('orientation' in window) {
      hasTouchScreen = true // deprecated, but good fallback
    } else {
      // Only as a last resort, fall back to user agent sniffing
      // @ts-ignore
      const UA = navigator.userAgent
      hasTouchScreen =
        /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) || /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA)
    }
  }

  return hasTouchScreen
}

// Singleton state management
const subscribers = new Set<(value: boolean) => void>()
let isMobileValue = typeof window !== 'undefined' ? detectIsMobile() : false
let isListenerAttached = false

/** Updates the mobile state and notifies all subscribers */
function setIsMobile(value: boolean): void {
  if (value !== isMobileValue) {
    isMobileValue = value
    subscribers.forEach((callback) => callback(value))
  }
}

// Initialize global listener
if (typeof window !== 'undefined' && !isListenerAttached) {
  window.addEventListener('resize', () => {
    setIsMobile(detectIsMobile())
  })
  isListenerAttached = true
}

/**
 * Hook that returns whether the current device is a mobile device.
 * Uses a singleton pattern to share state across components and
 * only attaches one resize listener globally.
 *
 * @example
 * ```tsx
 * import { useIsMobile } from 'path/to/useIsMobile'
 *
 * function MyComponent() {
 *   const isMobile = useIsMobile()
 *
 *   return (
 *     <div>
 *       {isMobile ? (
 *         <MobileView />
 *       ) : (
 *         <DesktopView />
 *       )}
 *     </div>
 *   )
 * }
 * ```
 */
export default function useIsMobile() {
  const [isMobile, setLocalIsMobile] = useState(isMobileValue)

  // Subscribe to the resize event on mount
  useEffect(() => {
    // Sync with latest value on mount
    if (isMobile !== isMobileValue) {
      setLocalIsMobile(isMobileValue)
    }

    const callback = (value: boolean) => setLocalIsMobile(value)
    subscribers.add(callback)

    return () => {
      subscribers.delete(callback)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return isMobile
}
