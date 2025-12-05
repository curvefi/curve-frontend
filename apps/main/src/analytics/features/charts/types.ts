import type { ISeriesApi } from 'lightweight-charts'

export type Period = '7d' | '1m' | '3m' | '6m' | '1y'
export const DAYS: Record<Period, number> = {
  '7d': 7,
  '1m': 30,
  '3m': 90,
  '6m': 180,
  '1y': 365,
}

/** A couple of things (like exporting data) are only supported for charts whose data is of type SingleValueData. */
export type SingleValueSerie = ISeriesApi<'Area' | 'Histogram' | 'Line' | 'Baseline'>
