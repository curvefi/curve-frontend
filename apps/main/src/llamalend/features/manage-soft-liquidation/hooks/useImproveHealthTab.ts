import { useCallback } from 'react'
import { useAccount } from 'wagmi'
import { useUserBalances } from '@/llamalend/queries/user-balances.query'
import type { Decimal } from '@ui-kit/utils'
import type { ImproveHealthProps } from '..'
import { useRepay } from '../../../mutations/repay.mutation'
import type { MarketParams } from '../types'
import { useDebtToken } from './useDebtToken'

/** Hook to cobble up the improve health tab */
export function useImproveHealthTab(params: MarketParams): ImproveHealthProps {
  const { address: userAddress } = useAccount()
  const { data: userBalances } = useUserBalances({ chainId: params.chainId, poolId: params.marketId, userAddress })

  const debtToken = useDebtToken(params)

  const repay = useRepay({ ...params, userAddress })
  const onRepay = useCallback(
    (debt: Decimal) => {
      repay.mutate({ debt })
    },
    [repay],
  )

  return {
    debtToken,
    userBalance: userBalances?.borrowed,
    status: repay.isPending ? 'repay' : 'idle',
    onDebtBalance: () => {}, // TODO: Implement for new health prediction
    onRepay,
    onApproveLimited: () => {}, // TODO: Implement approve flow
    onApproveInfinite: () => {}, // TODO: Implement approve flow
  }
}
