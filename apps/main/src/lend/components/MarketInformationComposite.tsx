import { ChartAndActivityComp } from '@/lend/components/ChartAndActivityComp'
import { networks } from '@/lend/networks'
import { PageContentProps } from '@/lend/types/lend.types'
import { AdvancedDetails, MarketInfoLayout } from '@/llamalend/features/market-advanced-information'
import { MarketHistoricalRatesChart } from '@/llamalend/widgets/MarketHistoricalRatesChart'
import { MarketRateCurveChart } from '@/llamalend/widgets/MarketRateCurveChart'
import type { Chain } from '@curvefi/prices-api'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { getLib } from '@ui-kit/features/connect-wallet'
import { useMarketInterestRatesAndUtilizationChart } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { LlamaMarketType } from '@ui-kit/types/market'
import type { Range } from '@ui-kit/types/util'
import { PAGE_SPACING } from '@ui-kit/widgets/DetailPageLayout/constants'

type MarketInformationCompProps = {
  pageProps: PageContentProps
  type: 'borrow' | 'supply'
  previewPrices?: Range<Decimal> | undefined
}

/**
 * Reusable component for OHLC charts, Bands (if applicable), and market parameters, used in market and vault pages.
 */
export const MarketInformationComposite = ({ pageProps, type, previewPrices }: MarketInformationCompProps) => {
  const { rChainId, rOwmId, market } = pageProps
  const api = getLib('llamaApi')
  const isBorrow = type === 'borrow'
  const blockchainId = networks[rChainId].id as Chain

  return (
    <Stack gap={PAGE_SPACING}>
      {isBorrow && <ChartAndActivityComp rChainId={rChainId} rOwmId={rOwmId} api={api} previewPrices={previewPrices} />}

      {isBorrow && <MarketHistoricalRatesChart market={market} blockchainId={blockchainId} rateMode="borrow" />}
      <MarketHistoricalRatesChart market={market} blockchainId={blockchainId} rateMode="supply" />

      {useMarketInterestRatesAndUtilizationChart() && (
        <MarketRateCurveChart market={market} blockchainId={blockchainId} chainId={rChainId} marketId={rOwmId} />
      )}

      <Card size="small">
        <CardHeader title={t`Advanced Details`} />
        <CardContent component={Stack}>
          <AdvancedDetails chainId={rChainId} marketId={rOwmId} market={market} marketType={LlamaMarketType.Lend} />
          <MarketInfoLayout
            chainId={rChainId}
            marketType={LlamaMarketType.Lend}
            market={market}
            network={networks[rChainId]}
          />
        </CardContent>
      </Card>
    </Stack>
  )
}
