import type { QueryBase, QueryUsdRates } from '@/entities/usd-rates'

export const usdRatesKeys = {
  base: ({ chainId }: QueryBase) => {
    return ['usdRatesBase', chainId] as const
  },

  // query
  usdRates: ({ addresses, ...rest }: QueryUsdRates) => {
    return [...usdRatesKeys.base(rest), 'usdRates', addresses] as const
  },
}
