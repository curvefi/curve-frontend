import { useCallback } from 'react'
import { useConnection } from 'wagmi'
import { useRepayMutation } from '@/llamalend/mutations/repay.mutation'
import { useUserBalances } from '@/llamalend/queries/user'
import type { Decimal } from '@ui-kit/utils'
import { SLIPPAGE_PRESETS } from '@ui-kit/widgets/SlippageSettings/slippage.utils'
import type { ImproveHealthProps } from '..'
import type { MarketParams } from '../types'
import { useDebtToken } from './useDebtToken'

/** Hook to cobble up the "improve health" tab */
export function useImproveHealthTab(params: MarketParams): ImproveHealthProps {
  const { address: userAddress } = useConnection()
  const { data: userBalances } = useUserBalances({ ...params, userAddress })

  const debtToken = useDebtToken(params)
  const { mutate, isPending } = useRepayMutation({ ...params, onRepaid: console.warn, userAddress })
  const onRepay = useCallback(
    (debt: Decimal) => {
      mutate({
        stateCollateral: '0' as Decimal,
        userCollateral: '0' as Decimal,
        userBorrowed: debt,
        isFull: false, // todo: implement full repays
        slippage: SLIPPAGE_PRESETS.STABLE,
      })
    },
    [mutate],
  )

  return {
    debtToken,
    userBalance: userBalances?.borrowed,
    status: isPending ? 'repay' : 'idle',
    onDebtBalance: () => {}, // TODO: Implement for new health prediction
    onRepay,
    onApproveLimited: () => {}, // TODO: Implement approve flow
    onApproveInfinite: () => {}, // TODO: Implement approve flow
  }
}
