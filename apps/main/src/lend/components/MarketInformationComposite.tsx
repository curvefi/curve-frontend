import { ChartAndActivityComp, MarketActivityComp } from '@/lend/components/ChartAndActivityComp'
import { networks } from '@/lend/networks'
import { MarketAdvancedDetails, MarketInfoLayout } from '@/llamalend/features/market-advanced-information'
import { MarketOverviewCard } from '@/llamalend/features/market-advanced-information/MarketOverviewCard'
import { useMarketContext } from '@/llamalend/features/market-context'
import { MarketFaqCard } from '@/llamalend/features/market-faq/MarketFaqCard'
import { MarketCardHeader } from '@/llamalend/widgets/MarketCardHeader'
import { MarketHistoricalRatesChart } from '@/llamalend/widgets/MarketHistoricalRatesChart'
import { MarketRateCurveChart } from '@/llamalend/widgets/MarketRateCurveChart'
import { useNewLlamaMarketDetailPage } from '@evm-ui/hooks/useFeatureFlags'
import { t } from '@evm-ui/lib/i18n'
import { MarketRateType } from '@evm-ui/types/market'
import { PAGE_SPACING } from '@evm-ui/widgets/DetailPageLayout/constants'
import { DetailPageSection as MarketSection } from '@evm-ui/widgets/DetailPageLayout/DetailPageSection'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import type { Range } from '@ui/features/queries/util'

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
      {isNewLlamaMarketDetailPage && (
        <MarketSection id="market-overview">
          <MarketOverviewCard network={networks[chainId]} />
        </MarketSection>
      )}
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
        <MarketFaqCard />
      </MarketSection>
    </Stack>
  )
}
