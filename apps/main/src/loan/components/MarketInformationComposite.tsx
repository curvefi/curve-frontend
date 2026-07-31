import { MarketAdvancedDetails, MarketInfoLayout } from '@/llamalend/features/market-advanced-information'
import { MarketFaqCard } from '@/llamalend/features/market-faq/MarketFaqCard'
import { CrvUsdPriceChart } from '@/llamalend/widgets/CrvUsdPriceChart'
import { MarketSection } from '@/llamalend/widgets/market-section-nav'
import { MarketCardHeader } from '@/llamalend/widgets/MarketCardHeader'
import { MarketHistoricalRatesChart } from '@/llamalend/widgets/MarketHistoricalRatesChart'
import { ChartAndActivityComp, MarketActivityComp } from '@/loan/components/ChartAndActivityComp'
import type { ChainId } from '@/loan/types/loan.types'
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
import { useMarketContext } from '../../llamalend/features/market-context'
import { networks } from '../networks'

type MarketInformationCompProps = {
  previewPrices: Range<Decimal> | undefined
}

export const MarketInformationComposite = ({ previewPrices }: MarketInformationCompProps) => {
  const { chainId } = useMarketContext<ChainId>()
  const isNewLlamaMarketDetailPage = useNewLlamaMarketDetailPage()
  const Header = isNewLlamaMarketDetailPage ? MarketCardHeader : CardHeader

  return (
    <Stack sx={{ gap: PAGE_SPACING }}>
      <MarketSection id="price-chart" ariaLabel={t`Risk and liquidation`}>
        <Stack sx={{ gap: PAGE_SPACING }}>
          <ChartAndActivityComp previewPrices={previewPrices} />
          <CrvUsdPriceChart />
        </Stack>
      </MarketSection>
      <MarketSection id="historical-rates" ariaLabel={t`Rates`}>
        <MarketHistoricalRatesChart rateMode={MarketRateType.Borrow} />
      </MarketSection>
      {isNewLlamaMarketDetailPage && (
        <MarketSection id="market-activity" ariaLabel={t`Market activity`}>
          <MarketActivityComp />
        </MarketSection>
      )}
      <MarketSection id="market-parameters" ariaLabel={t`Advanced details`}>
        <Card size="small" data-testid="market-parameters-card">
          <Header title={t`Advanced Details`} />
          <CardContent component={Stack}>
            {!isNewLlamaMarketDetailPage && <MarketAdvancedDetails />}
            <MarketInfoLayout network={networks[chainId]} />
          </CardContent>
        </Card>
      </MarketSection>
      <MarketSection id="faqs" ariaLabel={t`Frequently asked questions`}>
        <MarketFaqCard />
      </MarketSection>
    </Stack>
  )
}
