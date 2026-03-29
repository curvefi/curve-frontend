import type { EChartsOption } from 'echarts-for-react'
import { useMemo } from 'react'
import { PRICE_SCALE_MARGINS } from '@ui-kit/features/candle-chart'

type Params = {
  option: EChartsOption
  priceRange?: { min: number; max: number }
}

export const useBandsChartZoom = ({ option, priceRange }: Params): EChartsOption =>
  useMemo(() => {
    if (!priceRange) return option

    // The candle chart's getVisibleRange() returns the content range (excluding scale margins).
    // Expand by the same margin fractions so price levels align visually between the two charts.
    const span = priceRange.max - priceRange.min
    return {
      ...option,
      yAxis: {
        ...(option.yAxis as object),
        min: priceRange.min - PRICE_SCALE_MARGINS.bottom * span,
        max: priceRange.max + PRICE_SCALE_MARGINS.top * span,
      },
    }
  }, [option, priceRange])
