import { createQueryHook, useQueryMapping } from '@/shared/lib/queries'
import { getTokenUsdRateQueryOptions } from '@/entities/token/model'
import { ChainQueryParams } from '@/entities/chain'

export const useTokenUsdRate = createQueryHook(getTokenUsdRateQueryOptions)
export const useTokenUsdRates = ({ chainId, tokenAddresses = [] }: ChainQueryParams & { tokenAddresses?: string[] }) =>
  useQueryMapping(
    tokenAddresses.map((tokenAddress) => getTokenUsdRateQueryOptions({ chainId, tokenAddress })),
    tokenAddresses,
  )
