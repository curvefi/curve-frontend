import { ChartAndActivityComp } from '@/lend/components/ChartAndActivityComp'
import { networks } from '@/lend/networks'
import {
  AdvancedDetails,
  MarketInfoLayout,
  MarketParametersCard,
} from '@/llamalend/features/market-advanced-information'
import { useMarketContext } from '@/llamalend/features/market-context'
import { MarketFaq } from '@/llamalend/features/market-faq'
import { MarketHistoricalRatesChart } from '@/llamalend/widgets/MarketHistoricalRatesChart'
import { MarketRateCurveChart } from '@/llamalend/widgets/MarketRateCurveChart'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import { MarketRateType } from '@ui-kit/types/market'
import type { Range } from '@ui-kit/types/util'
import { PAGE_SPACING } from '@ui-kit/widgets/DetailPageLayout/constants'

type MarketInformationCompProps = {
  rateType: MarketRateType
  previewPrices?: Range<Decimal> | undefined
  isMarketDetailPageV2: boolean
}

/**
 * Reusable component for OHLC charts, Bands (if applicable), and market parameters, used in market and vault pages.
 */
export const MarketInformationComposite = ({
  rateType,
  previewPrices,
  isMarketDetailPageV2,
}: MarketInformationCompProps) => {
  const { chainId } = useMarketContext()
  return (
    <Stack sx={{ gap: PAGE_SPACING }}>
      {rateType === MarketRateType.Borrow && (
        <>
          <ChartAndActivityComp previewPrices={previewPrices} />
          <MarketHistoricalRatesChart rateMode={MarketRateType.Borrow} />
        </>
      )}
      <MarketHistoricalRatesChart rateMode={MarketRateType.Supply} />
      <MarketRateCurveChart />
      {isMarketDetailPageV2 ? (
        <MarketParametersCard network={networks[chainId]} />
      ) : (
        <Card size="small">
          <CardHeader title={t`Advanced Details`} />
          <CardContent component={Stack}>
            <AdvancedDetails />
            <MarketInfoLayout network={networks[chainId]} />
          </CardContent>
        </Card>
      )}

      <MarketFaq />
    </Stack>
  )
}
