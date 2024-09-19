import type { QueryBase, QueryUsdRates } from '@/entities/usd-rates'

export function enableBase({ chainId }: QueryBase) {
  return !!chainId
}

export const enableUsdRates = ({ addresses, ...rest }: QueryUsdRates) => {
  return enableBase(rest) && addresses.length > 0
}
