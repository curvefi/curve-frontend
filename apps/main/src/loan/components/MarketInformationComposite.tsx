import { MarketAdvancedDetails, MarketInfoLayout } from '@/llamalend/features/market-advanced-information'
import { MarketOverviewCard } from '@/llamalend/features/market-advanced-information/MarketOverviewCard'
import { MarketFaqCard } from '@/llamalend/features/market-faq/MarketFaqCard'
import { MarketBorrowRateBreakdown } from '@/llamalend/features/rate-breakdown/MarketRateBreakdowns'
import { CrvUsdPriceChart } from '@/llamalend/widgets/CrvUsdPriceChart'
import { MarketCardHeader } from '@/llamalend/widgets/MarketCardHeader'
import { MarketHistoricalRatesChart } from '@/llamalend/widgets/MarketHistoricalRatesChart'
import { ChartAndActivityComp, MarketActivityComp } from '@/loan/components/ChartAndActivityComp'
import { useNewLlamaMarketDetailPage } from '@evm-ui/hooks/useFeatureFlags'
import { t } from '@evm-ui/lib/i18n'
import { MarketRateType } from '@evm-ui/types/market'
import { stackedMarketCardHeadersSx } from '@evm-ui/utils/mui'
import { PAGE_SPACING } from '@evm-ui/widgets/DetailPageLayout/constants'
import { DetailPageSection as MarketSection } from '@evm-ui/widgets/DetailPageLayout/DetailPageSection'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import type { Range } from '@ui/features/queries/util'

type MarketInformationCompProps = {
  previewPrices: Range<Decimal> | undefined
}

export const MarketInformationComposite = ({ previewPrices }: MarketInformationCompProps) => {
  const isNewLlamaMarketDetailPage = useNewLlamaMarketDetailPage()
  const Header = isNewLlamaMarketDetailPage ? MarketCardHeader : CardHeader

  return (
    <Stack sx={{ gap: PAGE_SPACING }}>
      {isNewLlamaMarketDetailPage && (
        <MarketSection id="market-overview">
          <MarketOverviewCard />
        </MarketSection>
      )}
      <MarketSection id="price-chart">
        <Stack sx={{ gap: PAGE_SPACING }}>
          <ChartAndActivityComp previewPrices={previewPrices} />
          <CrvUsdPriceChart />
        </Stack>
      </MarketSection>
      <MarketSection id="historical-rates">
        <Stack sx={stackedMarketCardHeadersSx}>
          <MarketHistoricalRatesChart rateMode={MarketRateType.Borrow} />
          <MarketBorrowRateBreakdown />
        </Stack>
      </MarketSection>
      {isNewLlamaMarketDetailPage && (
        <MarketSection id="market-activity">
          <MarketActivityComp />
        </MarketSection>
      )}
      <MarketSection id="market-parameters">
        <Card size="small" data-testid="market-parameters-card">
          <Header title={t`Advanced Details`} />
          <CardContent component={Stack}>
            {!isNewLlamaMarketDetailPage && <MarketAdvancedDetails />}
            <MarketInfoLayout />
          </CardContent>
        </Card>
      </MarketSection>
      <MarketSection id="faqs">
        <MarketFaqCard />
      </MarketSection>
    </Stack>
  )
}
