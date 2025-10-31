// === Constants ===
export const ALPHA = 0.3 // For geometric with exponent: higher -> slower start, steeper end
export const POWER_P = 4.0 // For additive power easing (ease-in when p>1)

// === Helper mapping functions ===

/**
 * Geometric interpolation with exponent α.
 * Slow start (ease-in) when α > 1.
 */
export const geometricMap = (value: number, minVal: number, maxVal: number, alpha: number = ALPHA): number => {
  const s2 = Math.min(Math.max(Math.pow(value, alpha), 0), 1)
  const ratio = maxVal / minVal
  return minVal * Math.pow(ratio, s2)
}

/**
 * Additive power easing.
 * Ease-in when p > 1.
 */
export const powerMap = (value: number, minVal: number, maxVal: number, p: number = POWER_P): number =>
  minVal + (maxVal - minVal) * Math.pow(value, p)

/**
 * Invert the power map.
 */
export const invertPowerMap = (value: number, minVal: number, maxVal: number, p: number = POWER_P): number => {
  if (maxVal <= minVal) return 0
  const normalized = (value - minVal) / (maxVal - minVal)
  return Math.pow(normalized, 1 / p)
}
