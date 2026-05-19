import { BandsChartToken } from './types'

export const getBandsChartToken = (address: string | undefined, symbol?: string): BandsChartToken =>
  address && symbol ? { address, symbol } : undefined
