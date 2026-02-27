import { Contract } from 'ethers'
import { ABI_VECRV } from '@/dao/abis/vecrv'
import { CONTRACT_VECRV, CONTRACT_CRV } from '@/dao/constants'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { queryFactory } from '@ui-kit/lib/model/query'
import { EmptyValidationSuite } from '@ui-kit/lib/validation'

const _fetchVeCrvStats = async () => {
  const provider = useWallet.getState().provider
  const veCrvContract = new Contract(CONTRACT_VECRV, ABI_VECRV, provider)
  const crvContract = new Contract(CONTRACT_CRV, ABI_VECRV, provider)

  const [totalLockedCrv, totalCrv, totalVeCrv] = await Promise.all([
    veCrvContract.supply(),
    crvContract.totalSupply(),
    veCrvContract.totalSupply(),
  ])

  return {
    totalVeCrv: BigInt(totalVeCrv),
    totalLockedCrv: BigInt(totalLockedCrv),
    totalCrv: BigInt(totalCrv),
    lockedPercentage: (Number(totalLockedCrv) / Number(totalCrv)) * 100,
  }
}

export const { useQuery: useStatsVecrvQuery } = queryFactory({
  queryKey: () => ['stats-vecrv'] as const,
  queryFn: _fetchVeCrvStats,
  category: 'detail',
  validationSuite: EmptyValidationSuite,
})
