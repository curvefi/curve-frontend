import { ChartAndActivityComp, MarketActivityComp } from '@/lend/components/ChartAndActivityComp'
import { networks } from '@/lend/networks'
import {
  AdvancedDetails,
  MarketInfoLayout,
  MarketParametersCard,
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

  if (!isMarketDetailPageV2) {
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
      {rateType === MarketRateType.Borrow && (
        <MarketSection id="price-chart" ariaLabel={t`Risk and liquidation`}>
          <ChartAndActivityComp previewPrices={previewPrices} chartOnly />
        </MarketSection>
      )}
      <MarketSection id="historical-rates" ariaLabel={t`Rates`}>
        <Stack sx={{ gap: PAGE_SPACING }}>
          {rateType === MarketRateType.Borrow && <MarketHistoricalRatesChart rateMode={MarketRateType.Borrow} />}
          <MarketHistoricalRatesChart rateMode={MarketRateType.Supply} />
          <MarketRateCurveChart />
        </Stack>
      </MarketSection>
      {rateType === MarketRateType.Borrow && (
        <MarketSection id="market-activity" ariaLabel={t`Market activity`}>
          <MarketActivityComp />
        </MarketSection>
      )}
      <MarketSection id="market-parameters" ariaLabel={t`Advanced details`}>
        <MarketParametersCard network={networks[chainId]} />
      </MarketSection>
      <MarketSection id="faqs" ariaLabel={t`Frequently asked questions`}>
        <MarketFaq />
      </MarketSection>
    </Stack>
  )
}
