import { invalidateLockerVecrvUser } from '@/dao/entities/locker-vecrv-user'
import type { ChainId } from '@/dao/types/dao.types'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { queryFactory, rootKeys } from '@evm-ui/lib/model'
import type { UserChainParams, UserChainQuery } from '@evm-ui/lib/model/query'
import { curveApiValidationGroup } from '@evm-ui/lib/model/query/curve-api-validation'
import { evmAddressValidationGroup } from '@evm-ui/lib/model/query/evm-address-validation'
import { createValidationSuite } from '@evm-ui/lib/validation'
import type { Decimal } from '@primitives/decimal.utils'

type LockerVecrvQuery = UserChainQuery<ChainId>
type LockerVecrvParams = UserChainParams<ChainId>

export type LockedAmountAndUnlockTime = {
  lockedAmount: Decimal
  /** Unix timestamp in milliseconds. */
  unlockTime: number
}

const lockerVecrvValidationSuite = createValidationSuite(({ chainId, userAddress }: LockerVecrvParams) => {
  curveApiValidationGroup({ chainId })
  evmAddressValidationGroup({ evmAddress: userAddress })
})

export const { useQuery: useLockerCrv, invalidate: invalidateLockerCrv } = queryFactory({
  queryKey: ({ chainId, userAddress }: LockerVecrvParams) =>
    [...rootKeys.userChain({ chainId, userAddress }), 'boosting.getCrv'] as const,
  queryFn: async ({ userAddress }: LockerVecrvQuery) =>
    (await requireLib('curveApi').boosting.getCrv([userAddress])) as Decimal,
  category: 'dao.user',
  validationSuite: lockerVecrvValidationSuite,
})

export const { useQuery: useLockerLockedAmountAndUnlockTime, invalidate: invalidateLockerLockedAmountAndUnlockTime } =
  queryFactory({
    queryKey: ({ chainId, userAddress }: LockerVecrvParams) =>
      [...rootKeys.userChain({ chainId, userAddress }), 'boosting.getLockedAmountAndUnlockTime'] as const,
    queryFn: async ({ userAddress }: LockerVecrvQuery) =>
      (await requireLib('curveApi').boosting.getLockedAmountAndUnlockTime([userAddress])) as LockedAmountAndUnlockTime,
    category: 'dao.user',
    validationSuite: lockerVecrvValidationSuite,
  })

export const { useQuery: useLockerVeCrv, invalidate: invalidateLockerVeCrv } = queryFactory({
  queryKey: ({ chainId, userAddress }: LockerVecrvParams) =>
    [...rootKeys.userChain({ chainId, userAddress }), 'boosting.getVeCrv'] as const,
  queryFn: async ({ userAddress }: LockerVecrvQuery) =>
    (await requireLib('curveApi').boosting.getVeCrv([userAddress])) as Decimal,
  category: 'dao.user',
  validationSuite: lockerVecrvValidationSuite,
})

export const invalidateVeCrvQueries = async ({ chainId, userAddress }: LockerVecrvParams) =>
  await Promise.all([
    invalidateLockerCrv({ chainId, userAddress }),
    invalidateLockerLockedAmountAndUnlockTime({ chainId, userAddress }),
    invalidateLockerVeCrv({ chainId, userAddress }),
    invalidateLockerVecrvUser({ chainId, userAddress }),
  ])
