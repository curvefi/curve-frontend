import { useMemo } from 'react'
import { ChartLiquidationRange } from '@/llamalend/widgets/ChartLiquidationRange'
import { useUserLoanDetails } from '@/loan/hooks/useUserLoanDetails'
import useStore from '@/loan/store/useStore'
import { HealthMode } from '@/loan/types/loan.types'

const ChartUserLiquidationRange = ({ healthMode, llammaId }: { healthMode: HealthMode; llammaId: string }) => {
  const loanDetails = useStore((state) => state.loans.detailsMapper[llammaId])
  const { userPrices: currPrices } = useUserLoanDetails(llammaId) ?? {}
  return (
    <ChartLiquidationRange
      isDetailView
      isManage
      data={useMemo(
        () => [
          {
            name: '',
            currLabel: 'LR',
            curr: [+(currPrices?.[1] ?? '0'), +(currPrices?.[0] ?? '0')],
            newLabel: currPrices ? 'LR' : 'LR',
            new: [0, 0],
            oraclePrice: loanDetails?.priceInfo?.oraclePrice ?? '',
            oraclePriceBand: loanDetails?.priceInfo?.oraclePriceBand ?? 0,
          },
        ],
        [currPrices, loanDetails?.priceInfo],
      )}
      healthColorKey={healthMode.colorKey}
    />
  )
}

export default ChartUserLiquidationRange
