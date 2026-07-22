import {
  AdvancedDetails,
  MarketInfoLayout,
  MarketParametersCard,
} from '@/llamalend/features/market-advanced-information'
import { MarketFaq } from '@/llamalend/features/market-faq'
import { CrvUsdPriceChart } from '@/llamalend/widgets/CrvUsdPriceChart'
import { MarketSection } from '@/llamalend/widgets/market-section-nav'
import { MarketHistoricalRatesChart } from '@/llamalend/widgets/MarketHistoricalRatesChart'
import { ChartAndActivityComp, MarketActivityComp } from '@/loan/components/ChartAndActivityComp'
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
  isMarketDetailPageV2: boolean
}

export const MarketInformationComposite = ({ previewPrices, isMarketDetailPageV2 }: MarketInformationCompProps) => {
  const { chainId } = useMarketContext<ChainId>()

  if (!isMarketDetailPageV2) {
    return (
      <Stack sx={{ gap: PAGE_SPACING }}>
        <ChartAndActivityComp previewPrices={previewPrices} />
        <MarketHistoricalRatesChart rateMode={MarketRateType.Borrow} />
        <CrvUsdPriceChart />
        <Card size="small">
          <CardHeader title={t`Advanced Details`} />
          <CardContent component={Stack}>
            <AdvancedDetails />
            <MarketInfoLayout network={networks[chainId]} />
          </CardContent>
        </Card>
        <MarketFaq />
      </Stack>
    )
  }

  return (
    <Stack sx={{ gap: PAGE_SPACING }}>
      <MarketSection id="price-chart" ariaLabel={t`Risk and liquidation`}>
        <Stack sx={{ gap: PAGE_SPACING }}>
          <ChartAndActivityComp previewPrices={previewPrices} chartOnly />
          <CrvUsdPriceChart />
        </Stack>
      </MarketSection>
      <MarketSection id="historical-rates" ariaLabel={t`Rates`}>
        <MarketHistoricalRatesChart rateMode={MarketRateType.Borrow} />
      </MarketSection>
      <MarketSection id="market-activity" ariaLabel={t`Market activity`}>
        <MarketActivityComp />
      </MarketSection>
      <MarketSection id="market-parameters" ariaLabel={t`Advanced details`}>
        <MarketParametersCard network={networks[chainId]} />
      </MarketSection>
      <MarketSection id="faqs" ariaLabel={t`Frequently asked questions`}>
        <MarketFaq />
      </MarketSection>
    </Stack>
  )
}
