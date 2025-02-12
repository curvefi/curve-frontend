import { SubTitle } from '@/lend/components/DetailsMarket/styles'
import { t } from '@ui-kit/lib/i18n'
import ChartLiquidationRange from '@/lend/components/ChartLiquidationRange'
import useStore from '@/lend/store/useStore'
import { useMemo } from 'react'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { PageContentProps } from '@/lend/types/lend.types'

const DetailsUserLoanChartLiquidationRange = ({ rChainId, rOwmId, userActiveKey }: PageContentProps) => {
  const loanDetailsPrices = useStore((state) => state.markets.pricesMapper[rChainId]?.[rOwmId]?.prices)
  const userLoanDetails = useStore((state) => state.user.loansDetailsMapper[userActiveKey]?.details)

  const theme = useUserProfileStore((state) => state.theme)

  const { prices: currPrices, status } = userLoanDetails ?? {}

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
