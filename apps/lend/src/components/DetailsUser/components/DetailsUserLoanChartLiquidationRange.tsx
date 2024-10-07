import { t } from '@lingui/macro'
import { useMemo } from 'react'
import ChartLiquidationRange from '@/components/ChartLiquidationRange'
import { SubTitle } from '@/components/DetailsMarket/styles'
import useStore from '@/store/useStore'

const DetailsUserLoanChartLiquidationRange = ({ rChainId, rOwmId, userActiveKey }: PageContentProps) => {
  const loanDetailsPrices = useStore((state) => state.markets.pricesMapper[rChainId]?.[rOwmId]?.prices)
  const theme = useStore((state) => state.themeType)
  const userLoanDetails = useStore((state) => state.user.loansDetailsMapper[userActiveKey]?.details)

  const { prices: currPrices, status } = userLoanDetails ?? {}

  // default to empty data to show chart
  const liqRangeData = useMemo(() => {
    return [
      {
        name: '',
        currLabel: 'LR',
        curr: [+(currPrices?.[1] ?? '0'), +(currPrices?.[0] ?? '0')],
        newLabel: currPrices ? 'LR' : 'LR',
        new: [0, 0],
        oraclePrice: loanDetailsPrices?.oraclePrice ?? '',
        oraclePriceBand: loanDetailsPrices?.oraclePriceBand ?? 0,
      },
    ]
  }, [currPrices, loanDetailsPrices])

  return (
    <div>
      <SubTitle>{t`Liquidation Range`}</SubTitle>
      <ChartLiquidationRange
        isDetailView
        isManage
        data={liqRangeData}
        height={150}
        healthColorKey={status?.colorKey}
        theme={theme}
      />
    </div>
  )
}

export default DetailsUserLoanChartLiquidationRange
