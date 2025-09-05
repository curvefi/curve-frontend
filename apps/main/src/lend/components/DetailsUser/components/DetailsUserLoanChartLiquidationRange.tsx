import { useMemo } from 'react'
import { SubTitle } from '@/lend/components/DetailsMarket/styles'
import { useUserLoanDetails } from '@/lend/hooks/useUserLoanDetails'
import useStore from '@/lend/store/useStore'
import { PageContentProps } from '@/lend/types/lend.types'
import { ChartLiquidationRange } from '@/llamalend/widgets/ChartLiquidationRange'
import { t } from '@ui-kit/lib/i18n'

const DetailsUserLoanChartLiquidationRange = ({ rChainId, rOwmId, userActiveKey }: PageContentProps) => {
  const loanDetailsPrices = useStore((state) => state.markets.pricesMapper[rChainId]?.[rOwmId]?.prices)
  const { prices: currPrices, status } = useUserLoanDetails(userActiveKey)

  // default to empty data to show chart
  const liqRangeData = useMemo(
    () => [
      {
        name: '',
        currLabel: 'LR',
        curr: [+(currPrices?.[1] ?? '0'), +(currPrices?.[0] ?? '0')],
        newLabel: currPrices ? 'LR' : 'LR',
        new: [0, 0],
        oraclePrice: loanDetailsPrices?.oraclePrice ?? '',
        oraclePriceBand: loanDetailsPrices?.oraclePriceBand ?? 0,
      },
    ],
    [currPrices, loanDetailsPrices],
  )

  return (
    <div>
      <SubTitle>{t`Liquidation Range`}</SubTitle>
      <ChartLiquidationRange isDetailView isManage data={liqRangeData} height={150} healthColorKey={status?.colorKey} />
    </div>
  )
}

export default DetailsUserLoanChartLiquidationRange
