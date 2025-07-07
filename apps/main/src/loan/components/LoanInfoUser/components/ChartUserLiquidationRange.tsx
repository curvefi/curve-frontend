import { useMemo } from 'react'
import ChartLiquidationRange from '@/loan/components/ChartLiquidationRange'
import { useUserLoanDetails } from '@/loan/hooks/useUserLoanDetails'
import useStore from '@/loan/store/useStore'
import { HealthMode } from '@/loan/types/loan.types'
import { useUserProfileStore } from '@ui-kit/features/user-profile'

const ChartUserLiquidationRange = ({ healthMode, llammaId }: { healthMode: HealthMode; llammaId: string }) => {
  const loanDetails = useStore((state) => state.loans.detailsMapper[llammaId])
  const { userPrices: currPrices } = useUserLoanDetails(llammaId) ?? {}

  const theme = useUserProfileStore((state) => state.theme)

  // default to empty data to show chart
  const liqRangeData = useMemo(
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
  )

  return (
    <ChartLiquidationRange
      isDetailView
      isManage
      data={liqRangeData}
      healthColorKey={healthMode.colorKey}
      theme={theme === 'light' ? 'default' : theme}
    />
  )
}

export default ChartUserLiquidationRange
