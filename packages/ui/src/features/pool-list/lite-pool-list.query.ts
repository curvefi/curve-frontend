import { group, test } from 'vest'
import { listLitePools } from '@curvefi/prices-api/pools'
import { queryFactory } from '@ui/features/queries/factory'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import type { FieldsOf } from '@ui/lib/validation/types'

type ChainQuery = { chainId: number }
type ChainParams = FieldsOf<ChainQuery>

export const { useQuery: useLitePoolList, queryKey: getLitePoolListQueryKey } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => ['chain', { chainId }, 'listLitePools'] as const,
  queryFn: (params: ChainQuery) => listLitePools(params),
  validationSuite: createValidationSuite(({ chainId }: ChainQuery) =>
    group('chainValidation', () => {
      test('chainId', () => {
        enforce(chainId).message('Chain ID is required').isNotEmpty().message('Invalid chain ID').isNumber()
      })
    }),
  ),
  category: 'dex.pools',
})
