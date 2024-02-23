import { SubTitle } from '@/components/DetailsMarket/styles'
import { t } from '@lingui/macro'
import ChartLiquidationRange from '@/components/ChartLiquidationRange'
import useStore from '@/store/useStore'
import { useMemo } from 'react'

const DetailsUserLoanChartLiquidationRange = ({
  rChainId,
  rOwmId,
  healthMode,
  userActiveKey,
}: PageContentProps & { healthMode: HealthMode }) => {
  const loanDetailsPrices = useStore((state) => state.markets.pricesMapper[rChainId]?.[rOwmId]?.prices)
  const theme = useStore((state) => state.themeType)
  const userLoanDetails = useStore((state) => state.user.loansDetailsMapper[userActiveKey]?.details)

  const { prices: currPrices } = userLoanDetails ?? {}

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
        healthColorKey={healthMode.colorKey}
        theme={theme}
      />
    </div>
  )
}

export default DetailsUserLoanChartLiquidationRange
