import { useCallback } from 'react'
import { ClosePositionProps } from '@/llamalend/features/manage-soft-liquidation'
import { useClosePositionMutation } from '@/llamalend/mutations/close-position.mutation'
import { useWagmiConnection } from '@ui-kit/features/connect-wallet/lib/wagmi/hooks'
import type { MarketParams } from '../types'
import { useCanClose } from './useCanClose'
import { useCollateralToRecover } from './useCollateralToRecover'
import { useDebtToken } from './useDebtToken'

/** Hook to cobble up the close position tab */
export function useClosePositionTab(params: MarketParams): ClosePositionProps {
  const { address: userAddress } = useWagmiConnection()
  const debtToken = useDebtToken(params)
  const collateralToRecover = useCollateralToRecover(params)
  const canClose = useCanClose(params)

  const { mutate, isPending } = useClosePositionMutation({ ...params, userAddress })
  const onClose = useCallback(() => mutate({}), [mutate]) // todo: rename to `closePosition`
  return {
    debtToken,
    collateralToRecover,
    canClose,
    status: isPending ? 'close' : 'idle',
    onClose,
  }
}
