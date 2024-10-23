import { tokenUsdRate } from '@/entities/token/model'
import { useQueryMapping } from '@/shared/lib/queries'
import { ChainParams } from '@/shared/model/query'

export const {
  getQueryData: getTokenUsdRateQueryData,
  useQuery: useTokenUsdRate,
  getQueryOptions: getTokenUsdRateQueryOptions
} = tokenUsdRate

export const useTokenUsdRates = ({ chainId, tokenAddresses = [] }: ChainParams & { tokenAddresses?: string[] }) =>
  useQueryMapping(
    tokenAddresses.map((tokenAddress) => getTokenUsdRateQueryOptions({ chainId, tokenAddress })),
    tokenAddresses
  )
