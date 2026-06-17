import { ChartAndActivityComp } from '@/lend/components/ChartAndActivityComp'
import { networks } from '@/lend/networks'
import { PageContentProps } from '@/lend/types/lend.types'
import { AdvancedDetails, MarketInfoLayout } from '@/llamalend/features/market-advanced-information'
import { MarketFaq } from '@/llamalend/features/market-faq'
import { MarketHistoricalRatesChart } from '@/llamalend/widgets/MarketHistoricalRatesChart'
import { MarketRateCurveChart } from '@/llamalend/widgets/MarketRateCurveChart'
import type { Chain } from '@curvefi/prices-api'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import { LlamaMarketType, MarketRateType } from '@ui-kit/types/market'
import type { Range } from '@ui-kit/types/util'
import { PAGE_SPACING } from '@ui-kit/widgets/DetailPageLayout/constants'

type MarketInformationCompProps = {
  pageProps: PageContentProps
  rateType: MarketRateType
  previewPrices?: Range<Decimal>
}

/**
 * Reusable component for OHLC charts, Bands (if applicable), and market parameters, used in market and vault pages.
 */
export const MarketInformationComposite = ({ pageProps, rateType, previewPrices }: MarketInformationCompProps) => {
  const { chainId, marketQuery } = pageProps
  const { data: market } = marketQuery
  const isBorrow = rateType === MarketRateType.Borrow
  const blockchainId = networks[chainId].id as Chain

  return (
    <Stack sx={{ gap: PAGE_SPACING }}>
      {isBorrow && <ChartAndActivityComp chainId={chainId} marketQuery={marketQuery} previewPrices={previewPrices} />}
      {isBorrow && (
        <MarketHistoricalRatesChart
          market={market}
          blockchainId={blockchainId}
          chainId={chainId}
          rateMode={MarketRateType.Borrow}
        />
      )}
      <MarketHistoricalRatesChart
        market={market}
        blockchainId={blockchainId}
        chainId={chainId}
        rateMode={MarketRateType.Supply}
      />
      <MarketRateCurveChart market={market} blockchainId={blockchainId} chainId={chainId} />
      <Card size="small">
        <CardHeader title={t`Advanced Details`} />
        <CardContent component={Stack}>
          <AdvancedDetails chainId={chainId} market={market} marketType={LlamaMarketType.Lend} />
          <MarketInfoLayout
            chainId={chainId}
            marketType={LlamaMarketType.Lend}
            market={market}
            network={networks[chainId]}
          />
        </CardContent>
      </Card>

      <MarketFaq />
    </Stack>
  )
}
