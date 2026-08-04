import { ChartAndActivityComp, MarketActivityComp } from '@/lend/components/ChartAndActivityComp'
import { networks } from '@/lend/networks'
import { MarketAdvancedDetails, MarketInfoLayout } from '@/llamalend/features/market-advanced-information'
import { useMarketContext } from '@/llamalend/features/market-context'
import { MarketFaq } from '@/llamalend/features/market-faq'
import { MarketCardHeader } from '@/llamalend/widgets/MarketCardHeader'
import { MarketHistoricalRatesChart } from '@/llamalend/widgets/MarketHistoricalRatesChart'
import { MarketRateCurveChart } from '@/llamalend/widgets/MarketRateCurveChart'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { useNewLlamaMarketDetailPage } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { MarketRateType } from '@ui-kit/types/market'
import type { Range } from '@ui-kit/types/util'
import { PAGE_SPACING } from '@ui-kit/widgets/DetailPageLayout/constants'
import { DetailPageSection as MarketSection } from '@ui-kit/widgets/DetailPageLayout/DetailPageSection'

type MarketInformationCompProps = {
  rateType: MarketRateType
  previewPrices?: Range<Decimal> | undefined
}

/**
 * Reusable component for OHLC charts, Bands (if applicable), and market parameters, used in market and vault pages.
 */
export const MarketInformationComposite = ({ rateType, previewPrices }: MarketInformationCompProps) => {
  const { chainId } = useMarketContext()
  const isNewLlamaMarketDetailPage = useNewLlamaMarketDetailPage()
  const isBorrow = rateType === MarketRateType.Borrow
  const Header = isNewLlamaMarketDetailPage ? MarketCardHeader : CardHeader

  return (
    <Stack sx={{ gap: PAGE_SPACING }}>
      {isBorrow && (
        <MarketSection id="price-chart">
          <ChartAndActivityComp previewPrices={previewPrices} />
        </MarketSection>
      )}
      <MarketSection id="historical-rates">
        <Stack sx={{ gap: PAGE_SPACING }}>
          {isBorrow && <MarketHistoricalRatesChart rateMode={MarketRateType.Borrow} />}
          <MarketHistoricalRatesChart rateMode={MarketRateType.Supply} />
          <MarketRateCurveChart />
        </Stack>
      </MarketSection>
      {isBorrow && isNewLlamaMarketDetailPage && (
        <MarketSection id="market-activity">
          <MarketActivityComp />
        </MarketSection>
      )}
      <MarketSection id="market-parameters">
        <Card size="small" data-testid="market-parameters-card">
          <Header title={t`Advanced Details`} />
          <CardContent component={Stack}>
            {!isNewLlamaMarketDetailPage && <MarketAdvancedDetails />}
            <MarketInfoLayout network={networks[chainId]} />
          </CardContent>
        </Card>
      </MarketSection>
      <MarketSection id="faqs">
        <MarketFaq />
      </MarketSection>
    </Stack>
  )
}
