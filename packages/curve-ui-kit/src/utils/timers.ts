/**
 * Replaces setInterval using recursive setTimeout.
 * Returns a cancel function to stop future executions.
 *
 * - Schedules the first run after `delay` ms (like setInterval).
 * - Awaits sync/async callbacks before scheduling the next run to avoid overlap.
 */
export function setTimeoutInterval(callback: () => void | Promise<unknown>, delay: number): () => void {
  let canceled = false
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  const tick = () =>
    // Execute the callback and only then schedule the next tick
    !canceled &&
    void Promise.resolve()
      .then(callback)
      .finally(() => !canceled && (timeoutId = setTimeout(tick, delay)))

  timeoutId = setTimeout(tick, delay)

  // Cancel function clears any pending timeout and prevents rescheduling
  return () => {
    canceled = true
    if (timeoutId !== undefined) clearTimeout(timeoutId)
  }
}
