/**
 * Replaces setInterval using recursive setTimeout.
 * Returns a cancel function to stop future executions.
 *
 * - Schedules the first run after `delay` ms (like setInterval).
 * - Awaits sync/async callbacks before scheduling the next run to avoid overlap.
 */
export function setTimeoutInterval(callback: () => unknown, delay: number): () => void {
  let canceled = false
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  const tick = async () => {
    if (canceled) return
    try {
      await callback()
    } catch (e) {
      console.error('Error in setTimeoutInterval callback:', callback, e)
    } finally {
      if (!canceled) timeoutId = setTimeout(tick, delay)
    }
  }

  timeoutId = setTimeout(tick, delay)

  return () => {
    canceled = true
    clearTimeout(timeoutId)
  }
}
