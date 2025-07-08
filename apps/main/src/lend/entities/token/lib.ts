import { ChainParams } from '@ui-kit/lib/model/query'
import { useQueryMapping } from '@ui-kit/lib/queries'
import { getTokenUsdRateQueryOptions } from './token-query'

export const useTokenUsdRates = ({ chainId, tokenAddresses = [] }: ChainParams & { tokenAddresses?: string[] }) => {
  const uniqueAddresses = Array.from(new Set(tokenAddresses))
  return useQueryMapping(
    uniqueAddresses.map(tokenAddress => getTokenUsdRateQueryOptions({ chainId, tokenAddress })),
    uniqueAddresses,
  )
}
