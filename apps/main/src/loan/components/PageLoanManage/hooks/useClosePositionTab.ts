import { useCallback, useMemo } from 'react'
import { useUserLoanDetails } from '@/loan/hooks/useUserLoanDetails'
import useStore from '@/loan/store/useStore'
import type { Llamma } from '@/loan/types/loan.types'
import { type ClosePositionProps } from '@ui-kit/features/manage-soft-liquidation'
import { getDebtToken, getCollateralToRecover, checkCanClose } from '@ui-kit/features/manage-soft-liquidation/helpers'
import { useClosePosition } from './mutations/useClosePosition'

type Props = {
  market: Llamma | null
  llammaId: string
}

export function useClosePositionTab({ market, llammaId }: Props): ClosePositionProps {
  // User data
  const { userState } = useUserLoanDetails(llammaId) ?? {}
  const userBalancesRaw = useStore((state) => state.loans.userWalletBalancesMapper[llammaId])
  const userBalances = useMemo(() => userBalancesRaw ?? {}, [userBalancesRaw])

  // Data properties for the tab component
  const debtToken = useMemo(() => getDebtToken({ market, userState }), [market, userState])
  const collateralToRecover = useMemo(() => getCollateralToRecover({ market, userState }), [market, userState])
  const canClose = useMemo(() => checkCanClose({ userState, userBalances }), [userBalances, userState])

  // Callback properties for the tab component
  const closePosition = useClosePosition({ market })
  const onClose = useCallback(() => {
    closePosition.mutate()
  }, [closePosition])

  const status = closePosition.isPending ? 'close' : 'idle'

  return { debtToken, collateralToRecover, canClose, status, onClose }
}
