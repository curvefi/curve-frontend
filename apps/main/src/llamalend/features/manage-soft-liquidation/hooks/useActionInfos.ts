import { useConnection } from 'wagmi'
import { useHealthQueries } from '@/llamalend/hooks/useHealthQueries'
import { getUserHealthOptions } from '@/llamalend/queries/user'
import type { ActionInfosProps } from '..'
import type { MarketParams } from '../types'
import { useCollateralInfo } from './useCollateralInfo'
import { useLoanInfo } from './useLoanInfo'

/**
 * Hook to calculate the action info data when managing the soft liquidation
 * TODO: Contains some placeholder a data and does not respond to user input yet.
 */
export function useActionInfos(params: MarketParams): ActionInfosProps {
  const { address: userAddress } = useConnection()
  const { data: userHealth } = useHealthQueries((isFull) => getUserHealthOptions({ ...params, userAddress, isFull }))
  return {
    health: { current: Number(userHealth ?? 0) },
    loanInfo: useLoanInfo(params),
    collateral: useCollateralInfo(params),
    transaction: {
      estimatedTxCost: { eth: 0.0024, gwei: 0.72, dollars: 0.48 },
    },
  }
}
