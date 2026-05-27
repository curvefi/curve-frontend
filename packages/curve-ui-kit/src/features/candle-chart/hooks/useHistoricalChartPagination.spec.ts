import type { Time } from 'lightweight-charts'
import { describe, expect, it, vi } from 'vitest'
import { resolveHistoricalDataUpdate, startHistoricalPageFetch } from './useHistoricalChartPagination'

const visibleRange = { from: 1 as Time, to: 2 as Time }

describe('historical chart pagination helpers', () => {
  it('clears pending range and settles when no historical request is available', () => {
    const onRequestStarted = vi.fn()
    const onRequestUnavailable = vi.fn()
    const onRequestRejected = vi.fn()
    const onRequestSettled = vi.fn()

    startHistoricalPageFetch({
      fetchMoreChartData: () => undefined,
      isFetchInFlight: false,
      onRequestRejected,
      onRequestSettled,
      onRequestStarted,
      onRequestUnavailable,
    })

    expect(onRequestStarted).toHaveBeenCalledTimes(1)
    expect(onRequestUnavailable).toHaveBeenCalledTimes(1)
    expect(onRequestSettled).toHaveBeenCalledTimes(1)
    expect(onRequestRejected).not.toHaveBeenCalled()
  })

  it('clears pending range and settles when the historical request rejects', async () => {
    const onRequestStarted = vi.fn()
    const onRequestUnavailable = vi.fn()
    const onRequestRejected = vi.fn()
    const onRequestSettled = vi.fn()

    startHistoricalPageFetch({
      fetchMoreChartData: () => Promise.reject(new Error('failed')),
      isFetchInFlight: false,
      onRequestRejected,
      onRequestSettled,
      onRequestStarted,
      onRequestUnavailable,
    })
    await vi.waitFor(() => expect(onRequestSettled).toHaveBeenCalledTimes(1))

    expect(onRequestStarted).toHaveBeenCalledTimes(1)
    expect(onRequestRejected).toHaveBeenCalledTimes(1)
    expect(onRequestUnavailable).not.toHaveBeenCalled()
  })

  it('clears pending range and settles when starting the historical request throws', () => {
    const onRequestStarted = vi.fn()
    const onRequestUnavailable = vi.fn()
    const onRequestRejected = vi.fn()
    const onRequestSettled = vi.fn()

    startHistoricalPageFetch({
      fetchMoreChartData: () => {
        throw new Error('failed')
      },
      isFetchInFlight: false,
      onRequestRejected,
      onRequestSettled,
      onRequestStarted,
      onRequestUnavailable,
    })

    expect(onRequestStarted).toHaveBeenCalledTimes(1)
    expect(onRequestRejected).toHaveBeenCalledTimes(1)
    expect(onRequestSettled).toHaveBeenCalledTimes(1)
    expect(onRequestUnavailable).not.toHaveBeenCalled()
  })

  it('does not start another request while a historical fetch is already in flight', () => {
    const onRequestStarted = vi.fn()

    startHistoricalPageFetch({
      fetchMoreChartData: vi.fn(),
      isFetchInFlight: true,
      onRequestRejected: vi.fn(),
      onRequestSettled: vi.fn(),
      onRequestStarted,
      onRequestUnavailable: vi.fn(),
    })

    expect(onRequestStarted).not.toHaveBeenCalled()
  })

  it('restores the pending visible range after older data is prepended', () => {
    expect(
      resolveHistoricalDataUpdate({
        nextDataLength: 150,
        pendingVisibleRange: visibleRange,
        previousDataLength: 100,
      }),
    ).toEqual({
      nextDataLength: 150,
      pendingVisibleRange: null,
      resetInFlight: false,
      visibleRangeToRestore: visibleRange,
    })
  })

  it('clears the pending visible range when a historical request adds no data', () => {
    expect(
      resolveHistoricalDataUpdate({
        nextDataLength: 100,
        pendingVisibleRange: visibleRange,
        previousDataLength: 100,
      }),
    ).toEqual({
      nextDataLength: 100,
      pendingVisibleRange: null,
      resetInFlight: false,
      visibleRangeToRestore: null,
    })
  })

  it('clears pending range and in-flight state when chart data resets', () => {
    expect(
      resolveHistoricalDataUpdate({
        nextDataLength: 0,
        pendingVisibleRange: visibleRange,
        previousDataLength: 100,
      }),
    ).toEqual({
      nextDataLength: 0,
      pendingVisibleRange: null,
      resetInFlight: true,
      visibleRangeToRestore: null,
    })
  })
})
