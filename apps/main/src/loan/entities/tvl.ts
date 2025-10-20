import { getCrvUsdTvl } from '@curvefi/prices-api/crvusd'
import type { ChainNameParams, ChainNameQuery } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query'
import { chainNameValidationGroup } from '@ui-kit/lib/model/query/chain-name-validation'
import { createValidationSuite } from '@ui-kit/lib/validation'

export const { useQuery: useCrvUsdTvl } = queryFactory({
  queryKey: ({ blockchainId }: ChainNameParams) => ['getCrvUsdTvl', { blockchainId: blockchainId }, 'v1'] as const,
  queryFn: async ({ blockchainId }: ChainNameQuery): Promise<number> => {
    const { tvl } = await getCrvUsdTvl(blockchainId)
    return tvl
  },
  validationSuite: createValidationSuite(chainNameValidationGroup),
})
