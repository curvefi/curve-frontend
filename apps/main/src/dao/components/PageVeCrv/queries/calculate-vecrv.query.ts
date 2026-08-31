import type { ChainId } from '@/dao/types/dao.types'
import { requireLib } from '@evm-ui/features/connect-wallet'
import type { FieldsOf } from '@evm-ui/lib'
import { queryFactory, rootKeys } from '@evm-ui/lib/model'
import type { ChainParams, ChainQuery } from '@evm-ui/lib/model/query'
import type { Decimal } from '@primitives/decimal.utils'
import { calculateVeCrvValidationSuite } from './calculate-vecrv.validation'

export type CalculateVeCrvQuery = ChainQuery<ChainId> & {
  lockedAmount: Decimal
  /** Unix timestamp in seconds. */
  unlockTime: number
}

type CalculateVeCrvParams = FieldsOf<CalculateVeCrvQuery>

export const { useQuery: useCalculateVeCrv } = queryFactory({
  queryKey: ({ chainId, lockedAmount, unlockTime }: ChainParams<ChainId> & CalculateVeCrvParams) =>
    [...rootKeys.chain({ chainId }), 'lockCrv.calculateVeCrv', { lockedAmount }, { unlockTime }] as const,
  queryFn: ({ lockedAmount, unlockTime }: CalculateVeCrvQuery) =>
    Promise.resolve(requireLib('curveApi').boosting.calculateVeCrv(lockedAmount, unlockTime)),
  category: 'dao.user',
  validationSuite: calculateVeCrvValidationSuite,
})
