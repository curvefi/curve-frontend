import { tokenUsdRate } from '@/lend/entities/token/model'
import { useQueryMapping } from '@ui-kit/lib/queries'
import { ChainParams } from '@ui-kit/lib/model/query'

export const {
  getQueryData: getTokenUsdRateQueryData,
  useQuery: useTokenUsdRate,
  getQueryOptions: getTokenUsdRateQueryOptions,
} = tokenUsdRate

/**
 * todo: fix performance - curve-lending js that recalculates all usd rates every time we call the query
 */
export const useTokenUsdRates = ({ chainId, tokenAddresses = [] }: ChainParams & { tokenAddresses?: string[] }) => {
  const uniqueAddresses = Array.from(new Set(tokenAddresses))
  return useQueryMapping(
    uniqueAddresses.map((tokenAddress) => getTokenUsdRateQueryOptions({ chainId, tokenAddress })),
    uniqueAddresses,
  )
}
