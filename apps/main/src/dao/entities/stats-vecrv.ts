import { Contract } from 'ethers'
import { ABI_VECRV } from '@/dao/abis/vecrv'
import { CONTRACT_VECRV } from '@/dao/constants'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { queryFactory } from '@ui-kit/lib/model/query'
import { EmptyValidationSuite } from '@ui-kit/lib/validation'
import { MAINNET_CRV_ADDRESS } from '@ui-kit/utils'

const _fetchVeCrvStats = async () => {
  const provider = useWallet.getState().provider
  const veCrvContract = new Contract(CONTRACT_VECRV, ABI_VECRV, provider)
  const crvContract = new Contract(MAINNET_CRV_ADDRESS, ABI_VECRV, provider)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Existing violation before enabling this rule.
  const [totalLockedCrv, totalCrv, totalVeCrv] = await Promise.all([
    veCrvContract.supply(),
    crvContract.totalSupply(),
    veCrvContract.totalSupply(),
  ])

  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Existing violation before enabling this rule.
    totalVeCrv: BigInt(totalVeCrv),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Existing violation before enabling this rule.
    totalLockedCrv: BigInt(totalLockedCrv),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Existing violation before enabling this rule.
    totalCrv: BigInt(totalCrv),
    lockedPercentage: (Number(totalLockedCrv) / Number(totalCrv)) * 100,
  }
}

export const { useQuery: useStatsVecrvQuery } = queryFactory({
  queryKey: () => ['stats-vecrv'] as const,
  queryFn: _fetchVeCrvStats,
  category: 'dao.stats',
  validationSuite: EmptyValidationSuite,
})
