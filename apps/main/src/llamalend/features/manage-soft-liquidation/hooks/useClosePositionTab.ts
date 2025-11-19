import { useCallback } from 'react'
import { useClosePositionMutation } from '@/llamalend/features/manage-loan/mutations/close-position.mutation'
import type { ClosePositionProps } from '..'
import type { MarketParams } from '../types'
import { useCanClose } from './useCanClose'
import { useCollateralToRecover } from './useCollateralToRecover'
import { useDebtToken } from './useDebtToken'

/** Hook to cobble up the close position tab */
export function useClosePositionTab(params: MarketParams): ClosePositionProps {
  const debtToken = useDebtToken(params)
  const collateralToRecover = useCollateralToRecover(params)
  const canClose = useCanClose(params)

  const { mutate, isPending } = useClosePositionMutation(params)
  const onClose = useCallback(() => mutate({}), [mutate])
  return {
    debtToken,
    collateralToRecover,
    canClose,
    status: isPending ? 'close' : 'idle',
    onClose,
  }
}
