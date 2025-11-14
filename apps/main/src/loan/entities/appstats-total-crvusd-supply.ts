import type { ChainId } from '@/loan/types/loan.types'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { EmptyValidationSuite } from '@ui-kit/lib'
import type { ChainParams, ChainQuery } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'
import { decimal } from '@ui-kit/utils'

/**
 * Gets the total supply of crvUSD from the Curve Finance API.
 * It includes the fully supply and is more reliable than on-chain data.
 */
export const { useQuery: useCrvUsdTotalSupply } = queryFactory({
  queryKey: () => ['getCrvusdTotalSupplyNumber'] as const,
  queryFn: async () => {
    const resp = await fetch('https://api.curve.finance/api/getCrvusdTotalSupplyNumber')
    return decimal(await resp.text())
  },
  validationSuite: EmptyValidationSuite,
})

/**
 * Gets the total supply of crvUSD using the Llama API.
 * This query uses RPC data and seems to be missing some supply: https://github.com/curvefi/curve-api/commit/c9f8bf95
 */
export const { useQuery: useAppStatsTotalCrvusdSupply } = queryFactory({
  queryKey: (params: ChainParams<ChainId>) => ['appStatsTotalCrvusdSupply', { chainId: params.chainId }] as const,
  queryFn: async (_: ChainQuery<ChainId>) => await requireLib('llamaApi').totalSupply(),
  validationSuite: llamaApiValidationSuite,
})
