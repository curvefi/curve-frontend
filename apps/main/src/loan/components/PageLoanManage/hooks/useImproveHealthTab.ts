import { useCallback, useMemo, useState } from 'react'
import { useUserLoanDetails } from '@/loan/hooks/useUserLoanDetails'
import useStore from '@/loan/store/useStore'
import type { Llamma } from '@/loan/types/loan.types'
import { type ImproveHealthProps } from '@ui-kit/features/manage-soft-liquidation'
import { getDebtToken, parseFloatOptional } from '@ui-kit/features/manage-soft-liquidation/helpers'
import { useRepay } from './mutations/useRepay'

type Props = {
  market: Llamma | null
  llammaId: string
}

export function useImproveHealthTab({ market, llammaId }: Props): ImproveHealthProps {
  const [repayBalance, setRepayBalance] = useState(0)

  // User data
  const { userState } = useUserLoanDetails(llammaId) ?? {}
  const userBalancesRaw = useStore((state) => state.loans.userWalletBalancesMapper[llammaId])
  const { stablecoin: stablecoinBalance } = useMemo(() => userBalancesRaw ?? {}, [userBalancesRaw])
  const userBalance = parseFloatOptional(stablecoinBalance)

  // Data properties for the tab component
  const debtToken = useMemo(() => getDebtToken({ market, userState }), [market, userState])

  // Callback properties for the tab component
  const repay = useRepay({ market })
  const onRepay = useCallback(() => {
    repay.mutate({ debt: repayBalance.toString() })
  }, [repay, repayBalance])

  const onDebtBalance = useCallback((balance: number) => setRepayBalance(balance), [])

  const onApproveLimited = useCallback(() => {}, [])
  const onApproveInfinite = useCallback(() => {}, [])

  const status = repay.isPending ? 'repay' : 'idle'

  return { debtToken, userBalance, status, onDebtBalance, onRepay, onApproveLimited, onApproveInfinite }
}
