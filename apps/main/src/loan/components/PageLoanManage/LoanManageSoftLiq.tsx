import { useUserLoanDetails } from '@/loan/hooks/useUserLoanDetails'
import useStore from '@/loan/store/useStore'
import { Llamma } from '@/loan/types/loan.types'
import { ManageSoftLiquidation } from '@ui-kit/features/manage-soft-liquidation'
import { getCollateralInfo, getHealthInfo, getLoanInfo } from '@ui-kit/features/manage-soft-liquidation/helpers'
import { useClosePositionTab } from './hooks/useClosePositionTab'
import { useImproveHealthTab } from './hooks/useImproveHealthTab'

type Props = {
  market: Llamma | null
  llammaId: string
}

export const LoanManageSoftLiq = ({ market, llammaId }: Props) => {
  const userLoanDetails = useUserLoanDetails(llammaId)
  const { userState } = userLoanDetails ?? {}

  const loanDetails = useStore((state) => state.loans.detailsMapper[llammaId])
  const { parameters: loanParameters } = loanDetails ?? {}

  const health = getHealthInfo({ userLoanDetails })
  const loan = getLoanInfo({ market, loanParameters, userState })
  const collateral = getCollateralInfo({ market, userLoanDetails, userState })

  const actionInfos = {
    health,
    loan,
    collateral,
    transaction: {
      estimatedTxCost: { eth: 0.0024, gwei: 0.72, dollars: 0.48 },
    },
  }

  const improveHealth = useImproveHealthTab({ market, llammaId })
  const closePosition = useClosePositionTab({ market, llammaId })

  return <ManageSoftLiquidation actionInfos={actionInfos} improveHealth={improveHealth} closePosition={closePosition} />
}
