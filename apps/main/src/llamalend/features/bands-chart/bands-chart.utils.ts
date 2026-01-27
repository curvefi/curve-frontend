import { formatNumber } from '@ui-kit/utils'
import { BandsChartToken } from './types'

export const getBandsChartToken = (address: string | undefined, symbol?: string): BandsChartToken =>
  address && symbol ? { address, symbol } : undefined

/** matches candle-chart formatting but with simpler decimal management, maximumSignificantDigits does the same job but works in the bands-chart context */
export const formatNumberWithOptions = (value: number) =>
  formatNumber(value, {
    // only abbreviating above 10000 to avoid 4013 becoming 4.013k etc
    abbreviate: value >= 10000,
    maximumSignificantDigits: 4,
    useGrouping: false,
  })
