import { clamp } from 'lodash'
import { useMemo } from 'react'
import { invertPowerMap, powerMap } from '@ui-kit/utils/interpolations'

/**
 * Calculate a power exponent that feels "good" based on the max value.
 */
const calculatePowerExponent = (isPowerScale: boolean, minValue: number, maxValue: number): number | undefined => {
  if (!isPowerScale || maxValue <= minValue) return undefined
  const safeMax = Math.max(maxValue, 1)
  const exponent = Math.trunc(Math.log10(safeMax) - 2)
  return Math.max(exponent, 1)
}

/**
 * Helpers that convert real values to and from the slider's value space.
 */
export const useSliderValueTransform = ({
  min,
  max,
  isPowerScale,
}: {
  min: number
  max: number
  isPowerScale: boolean
}) =>
  useMemo(() => {
    const powerExponent = calculatePowerExponent(isPowerScale, min, max)
    if (powerExponent == null) {
      return
    }

    const [sliderMin, sliderMax] = [0, 1]
    return {
      /** Convert the current value into the 0-1 slider space. */
      toSlider: (value: number) => invertPowerMap(clamp(value, min, max), min, max, powerExponent),
      /** Bring the normalized slider value back into the actual units. */
      fromSlider: (value: number) => powerMap(clamp(value, sliderMin, sliderMax), min, max, powerExponent),
      sliderMin,
      sliderMax,
      sliderStep: 0.001,
    }
  }, [min, max, isPowerScale])
