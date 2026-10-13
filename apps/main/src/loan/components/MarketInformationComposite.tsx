import { MarketInfoLayout } from '@/llamalend/features/market-advanced-information/MarketInfoLayout'
import { MarketFaqCard } from '@/llamalend/features/market-faq/MarketFaqCard'
import { MarketHistoricalRatesTabs } from '@/llamalend/features/rate-breakdown/MarketRateBreakdowns'
import { CrvUsdPriceChart } from '@/llamalend/widgets/CrvUsdPriceChart'
import { ChartAndActivityComp, MarketActivityComp } from '@/loan/components/ChartAndActivityComp'
import { MarketRateType } from '@evm-ui/types/market'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { PAGE_SPACING } from '@ui/features/layout/DetailPageLayout/constants'
import { DetailPageSection as MarketSection } from '@ui/features/layout/DetailPageLayout/DetailPageSection'
import type { Range } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'

type MarketInformationCompProps = { previewPrices: Range<Decimal> | undefined }

export const MarketInformationComposite = ({ previewPrices }: MarketInformationCompProps) => (
  <Stack sx={{ gap: PAGE_SPACING }}>
    <MarketSection id="price-chart">
      <Stack sx={{ gap: PAGE_SPACING }}>
        <ChartAndActivityComp previewPrices={previewPrices} />
        <CrvUsdPriceChart />
      </Stack>
    </MarketSection>
    <MarketSection id="historical-rates">
      <MarketHistoricalRatesTabs rateType={MarketRateType.Borrow} />
    </MarketSection>
    <MarketSection id="market-activity">
      <MarketActivityComp />
    </MarketSection>
    <MarketSection id="market-parameters">
      <Card size="small" data-testid="market-parameters-card">
        <CardHeader title={t`Advanced Details`} />
        <CardContent component={Stack}>
          <MarketInfoLayout />
        </CardContent>
      </Card>
    </MarketSection>
    <MarketSection id="faqs">
      <MarketFaqCard />
    </MarketSection>
  </Stack>
)
