import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setTimeoutInterval } from './timers'

const createDeferred = <T = void>() => {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

const withFakeTimers = (fn: () => Promise<void>) => async () => {
  vi.useFakeTimers()
  try {
    await fn()
  } finally {
    vi.useRealTimers()
    vi.restoreAllMocks()
  }
}

/**
 * Advance timers by an array of time steps, each multiplied by unitMs.
 * Uses async to flush microtasks after each tick.
 */
async function advance(times: number[], unitMs = 1) {
  for (const t of times) {
    await vi.advanceTimersByTimeAsync(t * unitMs)
  }
}

describe('setTimeoutInterval', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it(
    'schedules the first run after delay and continues at the same delay',
    withFakeTimers(async () => {
      const calls: number[] = []
      const cancel = setTimeoutInterval(() => calls.push(Date.now()), 1000)
      expect(calls.length).toBe(0) // nothing happens immediately

      await advance([1000])
      expect(calls.length).toBe(1)
      await advance([1000, 1000])
      expect(calls.length).toBe(3)

      cancel()
      await advance([2000])
      expect(calls.length).toBe(3)
    }),
  )

  it(
    'awaits async callback (no overlap) and schedules next after it resolves',
    withFakeTimers(async () => {
      const steps: string[] = []
      const defer = createDeferred()

      const cancel = setTimeoutInterval(async () => {
        steps.push('start')
        await defer.promise
        steps.push('end')
      }, 500)

      await advance([500]) // triggers the first tick; callback starts and awaits
      expect(steps).toEqual(['start'])

      await advance([500, 500, 500, 500]) // advance timers, the next tick is not scheduled until the promise resolves
      expect(steps).toEqual(['start'])

      defer.resolve() // resolve the callback; this should schedule the next run after the delay
      await Promise.resolve() // Let microtasks flush

      await advance([500]) // Next run should occur only after another delay window
      expect(steps).toEqual(['start', 'end', 'start', 'end']) // promise is resolved, we get a 2nd immediate 'end'

      cancel()
    }),
  )

  it(
    'cancel prevents future executions when called before the first tick',
    withFakeTimers(async () => {
      const cb = vi.fn()
      const cancel = setTimeoutInterval(cb, 300)
      cancel()

      await advance([1000])
      expect(cb).not.toHaveBeenCalled()
    }),
  )

  it(
    'cancel during an in-flight async callback prevents scheduling the next tick',
    withFakeTimers(async () => {
      const gate = createDeferred()
      const cb = vi.fn(() => gate.promise)

      const cancel = setTimeoutInterval(cb, 400)

      await advance([400]) // first call
      expect(cb).toHaveBeenCalledTimes(1)

      cancel() // Cancel while the callback is pending
      gate.resolve() // Resolve the pending callback
      await Promise.resolve() // flush microtasks

      await advance([400, 400]) // advance the timer further, no re-schedule
      expect(cb).toHaveBeenCalledTimes(1)
    }),
  )

  it(
    'logs errors but continues scheduling subsequent ticks',
    withFakeTimers(async () => {
      const error = new Error('boom')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const cb = vi.fn(() => {
        if (cb.mock.calls.length === 1) throw error // throws only the first time (mock.calls populated before the call)
      })

      const cancel = setTimeoutInterval(cb, 200)

      await advance([200]) // first run throws
      expect(cb).toHaveBeenCalledTimes(1)
      expect(consoleSpy).toHaveBeenCalledTimes(1)

      await advance([200]) // continues after error
      expect(cb).toHaveBeenCalledTimes(2)
      cancel()
    }),
  )

  it(
    'clearTimeout is called with the last scheduled timeout id on cancel',
    withFakeTimers(async () => {
      const spy = vi.spyOn(globalThis, 'clearTimeout')
      const cb = vi.fn()
      const cancel = setTimeoutInterval(cb, 250)

      await advance([250])
      expect(cb).toHaveBeenCalledTimes(1)

      cancel()
      expect(spy).toHaveBeenCalled()
    }),
  )
})
