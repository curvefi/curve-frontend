export const PERIODS = ['7d', '1m', '3m', '6m', '1y'] as const
export type Period = (typeof PERIODS)[number]
export const DAYS: Record<Period, number> = {
  '7d': 7,
  '1m': 30,
  '3m': 90,
  '6m': 180,
  '1y': 365,
}
