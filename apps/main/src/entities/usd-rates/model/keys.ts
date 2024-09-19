import type { QueryBase, QueryUsdRates } from '@/entities/usd-rates'

export const keys = {
  base: ({ chainId }: QueryBase) => {
    return ['usdRatesBase', chainId] as const
  },

  // query
  usdRates: ({ addresses, ...rest }: QueryUsdRates) => {
    return [...keys.base(rest), 'usdRates', addresses] as const
  },
}
