import { ChartAndActivityComp, MarketActivityComp } from '@/lend/components/ChartAndActivityComp'
import { networks } from '@/lend/networks'
import {
  AdvancedDetailsMetrics,
  MarketInfoLayout,
  MarketAdvancedDetailsCard,
} from '@/llamalend/features/market-advanced-information'
import { useMarketContext } from '@/llamalend/features/market-context'
import { MarketFaq } from '@/llamalend/features/market-faq'
import { MarketSection } from '@/llamalend/widgets/market-section-nav'
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
  return (
    <Stack sx={{ gap: PAGE_SPACING }}>
      {isBorrow && (
        <MarketSection id="price-chart" ariaLabel={t`Risk and liquidation`}>
          <ChartAndActivityComp previewPrices={previewPrices} chartOnly />
        </MarketSection>
      )}
      <MarketSection id="historical-rates" ariaLabel={t`Rates`}>
        <Stack sx={{ gap: PAGE_SPACING }}>
          {isBorrow && <MarketHistoricalRatesChart rateMode={MarketRateType.Borrow} />}
          <MarketHistoricalRatesChart rateMode={MarketRateType.Supply} />
          <MarketRateCurveChart />
        </Stack>
      </MarketSection>
      {isBorrow && (
        <MarketSection id="market-activity" ariaLabel={t`Market activity`}>
          <MarketActivityComp />
        </MarketSection>
      )}
      <MarketSection id="market-parameters" ariaLabel={t`Advanced details`}>
        {isNewLlamaMarketDetailPage ? (
          <MarketAdvancedDetailsCard network={networks[chainId]} />
        ) : (
          <Card size="small">
            <CardHeader title={t`Advanced Details`} />
            <CardContent component={Stack}>
              <AdvancedDetailsMetrics />
              <MarketInfoLayout network={networks[chainId]} />
            </CardContent>
          </Card>
        )}
      </MarketSection>
      <MarketSection id="faqs" ariaLabel={t`Frequently asked questions`}>
        <MarketFaq />
      </MarketSection>
    </Stack>
  )
}
