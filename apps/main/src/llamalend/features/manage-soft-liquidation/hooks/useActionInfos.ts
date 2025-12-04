import { useAccount } from 'wagmi'
import { useHealthQueries } from '@/llamalend/hooks/useHealthQueries'
import { getUserHealthOptions } from '@/llamalend/queries/user-health.query'
import type { ActionInfosProps } from '..'
import type { MarketParams } from '../types'
import { useCollateralInfo } from './useCollateralInfo'
import { useLoanInfo } from './useLoanInfo'

/**
 * Hook to calculate the action info data when managing the soft liquidation
 * TODO: Contains some placeholder a data and does not respond to user input yet.
 */
export function useActionInfos(params: MarketParams): ActionInfosProps {
  const { address: userAddress } = useAccount()
  const { data: userHealth } = useHealthQueries((isFull) =>
    getUserHealthOptions(
      {
        ...{ ...params, userAddress },
        isFull,
      },
      undefined,
    ),
  )

  const health = { current: Number(userHealth ?? 0) }

  const loanInfo = useLoanInfo(params)
  const collateral = useCollateralInfo(params)

  return {
    health,
    loanInfo,
    collateral,
    transaction: {
      estimatedTxCost: { eth: 0.0024, gwei: 0.72, dollars: 0.48 },
    },
  }
}
