/** Not advised to use directly, because if we ever expand this we need to check if all charts using this directly supports the added period. */
export type Period = '7d' | '1m' | '3m' | '6m' | '1y'
export const DAYS: Record<Period, number> = {
  '7d': 7,
  '1m': 30,
  '3m': 90,
  '6m': 180,
  '1y': 365,
}
