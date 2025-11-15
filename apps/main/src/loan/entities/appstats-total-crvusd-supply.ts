import type { ChainId } from '@/loan/types/loan.types'
import { requireLib } from '@ui-kit/features/connect-wallet'
import type { ChainParams, ChainQuery } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'

/**
 * Gets the total supply of crvUSD using the Llama API.
 * This query uses RPC data and seems to be missing some supply: https://github.com/curvefi/curve-api/commit/c9f8bf95
 */
export const { useQuery: useAppStatsTotalCrvusdSupply } = queryFactory({
  queryKey: (params: ChainParams<ChainId>) => ['appStatsTotalCrvusdSupply', { chainId: params.chainId }] as const,
  queryFn: async (_: ChainQuery<ChainId>) => await requireLib('llamaApi').totalSupply(),
  validationSuite: llamaApiValidationSuite,
})
