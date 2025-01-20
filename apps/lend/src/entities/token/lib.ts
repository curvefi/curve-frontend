import { tokenUsdRate } from '@lend/entities/token/model'
import { useQueryMapping } from '@ui-kit/lib/queries'
import { ChainParams } from '@ui-kit/lib/model/query'

export const {
  getQueryData: getTokenUsdRateQueryData,
  useQuery: useTokenUsdRate,
  getQueryOptions: getTokenUsdRateQueryOptions,
} = tokenUsdRate

export const useTokenUsdRates = ({ chainId, tokenAddresses = [] }: ChainParams & { tokenAddresses?: string[] }) =>
  useQueryMapping(
    tokenAddresses.map((tokenAddress) => getTokenUsdRateQueryOptions({ chainId, tokenAddress })),
    tokenAddresses,
  )
