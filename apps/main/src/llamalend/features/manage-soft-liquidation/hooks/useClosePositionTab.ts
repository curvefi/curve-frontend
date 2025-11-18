import { useCallback } from 'react'
import type { ClosePositionProps } from '..'
import type { MarketParams } from '../types'
import { useClosePositionMutation } from '@/llamalend/features/manage-loan/mutations/close-position.mutation'
import type { UserMarketParams } from '@ui-kit/lib/model'
import { useCanClose } from './useCanClose'
import { useCollateralToRecover } from './useCollateralToRecover'
import { useDebtToken } from './useDebtToken'

/** Hook to cobble up the close position tab */
export function useClosePositionTab(params: MarketParams): ClosePositionProps {
  const debtToken = useDebtToken(params)
  const collateralToRecover = useCollateralToRecover(params)
  const canClose = useCanClose(params)

  const closePosition = useClosePositionMutation(params as UserMarketParams)
  const onClose = useCallback(() => {
    closePosition.mutate()
  }, [closePosition])

  return {
    debtToken,
    collateralToRecover,
    canClose,
    status: closePosition.isPending ? 'close' : 'idle',
    onClose,
  }
}
