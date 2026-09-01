import type { ChainId } from '@/dao/types/dao.types'
import { requireLib } from '@evm-ui/features/connect-wallet'
import type { ChainParams, ChainQuery, UserParams, UserQuery } from '@evm-ui/lib/model/query'
import { queryFactory } from '@evm-ui/lib/model/query'
import { curveApiValidationGroup } from '@evm-ui/lib/model/query/curve-api-validation'
import { evmAddressValidationGroup } from '@evm-ui/lib/model/query/evm-address-validation'
import { createValidationSuite } from '@evm-ui/lib/validation'

// There might be some overlap with locker-vecrv-info, but need to investigate and
// refactor that at a later time.
export const { useQuery: useLockerVecrvUser, invalidate: invalidateLockerVecrvUser } = queryFactory({
  queryKey: (params: ChainParams<ChainId> & UserParams) =>
    ['locker-vecrv-user', { chainId: params.chainId }, { userAddress: params.userAddress }] as const,
  queryFn: async ({ userAddress }: ChainQuery<ChainId> & UserQuery) =>
    await requireLib('curveApi').dao.userVeCrv(userAddress),
  category: 'dao.user',
  validationSuite: createValidationSuite((params: ChainParams<ChainId> & UserParams) => {
    curveApiValidationGroup({ chainId: params.chainId })
    evmAddressValidationGroup({ evmAddress: params.userAddress })
  }),
})
