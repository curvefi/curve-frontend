import { ABI_VECRV } from '@/dao/abis/vecrv'
import { CONTRACT_VECRV } from '@/dao/constants'
import type { Decimal } from '@primitives/decimal.utils'
import { getWagmiConfig } from '@ui-kit/features/connect-wallet/lib/wagmi/wagmi-config'
import { queryFactory } from '@ui-kit/lib/model/query'
import { EmptyValidationSuite } from '@ui-kit/lib/validation'
import { Chain, decimalDiv, decimalMultiply, fromWei, MAINNET_CRV_ADDRESS } from '@ui-kit/utils'
import { multicall } from '@wagmi/core'

export type VeCrvStats = {
  totalVeCrv: Decimal
  totalLockedCrv: Decimal
  totalCrv: Decimal
  lockedPercentage: Decimal
}

export const { useQuery: useStatsVecrvQuery } = queryFactory({
  queryKey: () => ['stats-vecrv'] as const,
  queryFn: async (): Promise<VeCrvStats> => {
    const config = getWagmiConfig()
    if (!config) throw new Error('Wagmi config is not initialized')

    const [totalLockedCrv, totalCrv, totalVeCrv] = await multicall(config, {
      allowFailure: false,
      chainId: Chain.Ethereum,
      contracts: [
        {
          address: CONTRACT_VECRV,
          abi: ABI_VECRV,
          functionName: 'supply',
        },
        {
          address: MAINNET_CRV_ADDRESS,
          abi: ABI_VECRV,
          functionName: 'totalSupply',
        },
        {
          address: CONTRACT_VECRV,
          abi: ABI_VECRV,
          functionName: 'totalSupply',
        },
      ],
    })
    const totalLockedCrvDecimal = fromWei(totalLockedCrv.toString(), 18)
    const totalCrvDecimal = fromWei(totalCrv.toString(), 18)

    return {
      totalVeCrv: fromWei(totalVeCrv.toString(), 18),
      totalLockedCrv: totalLockedCrvDecimal,
      totalCrv: totalCrvDecimal,
      lockedPercentage: +totalCrvDecimal
        ? decimalMultiply(decimalDiv(totalLockedCrvDecimal, totalCrvDecimal), '100')
        : '0',
    }
  },
  category: 'dao.stats',
  validationSuite: EmptyValidationSuite,
})
