import { AdvancedDetails, MarketInfoLayout } from '@/llamalend/features/market-advanced-information'
import { MarketFaq } from '@/llamalend/features/market-faq'
import type { ChartAndActivityTab } from '@/llamalend/widgets/ChartAndActivityLayout'
import { CrvUsdPriceChart } from '@/llamalend/widgets/CrvUsdPriceChart'
import { MarketSection, type MarketSectionRef } from '@/llamalend/widgets/market-section-nav'
import { MarketHistoricalRatesChart } from '@/llamalend/widgets/MarketHistoricalRatesChart'
import { ChartAndActivityComp } from '@/loan/components/ChartAndActivityComp'
import type { ChainId } from '@/loan/types/loan.types'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import { MarketRateType } from '@ui-kit/types/market'
import type { Range } from '@ui-kit/types/util'
import { PAGE_SPACING } from '@ui-kit/widgets/DetailPageLayout/constants'
import { useMarketContext } from '../../llamalend/features/market-context'
import { networks } from '../networks'

type MarketInformationCompProps = {
  previewPrices: Range<Decimal> | undefined
  sectionRefs: {
    chartAndActivity: MarketSectionRef
    historicalRates: MarketSectionRef
    advancedDetails: MarketSectionRef
    faqs: MarketSectionRef
  }
  chartAndActivityTab?: ChartAndActivityTab
  onChartAndActivityTabChange?: (tab: ChartAndActivityTab) => void
}

export const MarketInformationComposite = ({
  previewPrices,
  sectionRefs,
  chartAndActivityTab,
  onChartAndActivityTabChange,
}: MarketInformationCompProps) => {
  const { chainId } = useMarketContext<ChainId>()
  return (
    <Stack sx={{ gap: PAGE_SPACING }}>
      <MarketSection id="price-chart" sectionRef={sectionRefs.chartAndActivity}>
        <ChartAndActivityComp
          previewPrices={previewPrices}
          tab={chartAndActivityTab}
          onTabChange={onChartAndActivityTabChange}
        />
      </MarketSection>
      <MarketSection id="historical-rates" sectionRef={sectionRefs.historicalRates}>
        <MarketHistoricalRatesChart rateMode={MarketRateType.Borrow} />
      </MarketSection>
      <CrvUsdPriceChart />

      <MarketSection id="advanced-details" sectionRef={sectionRefs.advancedDetails}>
        <Card size="small">
          <CardHeader title={t`Advanced Details`} />
          <CardContent component={Stack}>
            <AdvancedDetails />
            <MarketInfoLayout network={networks[chainId]} />
          </CardContent>
        </Card>
      </MarketSection>

      <MarketSection id="faqs" sectionRef={sectionRefs.faqs}>
        <MarketFaq />
      </MarketSection>
    </Stack>
  )
}
