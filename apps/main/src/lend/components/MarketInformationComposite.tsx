import { ChartAndActivityComp } from '@/lend/components/ChartAndActivityComp'
import { networks } from '@/lend/networks'
import { PageContentProps } from '@/lend/types/lend.types'
import { AdvancedDetails, MarketInfoLayout } from '@/llamalend/features/market-advanced-information'
import { MarketFaq } from '@/llamalend/features/market-faq'
import { getAmmAddress, getControllerAddress, getTokens } from '@/llamalend/llama.utils'
import { MarketHistoricalRatesChart } from '@/llamalend/widgets/MarketHistoricalRatesChart'
import { MarketRateCurveChart } from '@/llamalend/widgets/MarketRateCurveChart'
import type { Chain } from '@curvefi/prices-api'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { getLib } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { LlamaMarketType, MarketRateType } from '@ui-kit/types/market'
import type { Range } from '@ui-kit/types/util'
import { PAGE_SPACING } from '@ui-kit/widgets/DetailPageLayout/constants'

type MarketInformationCompProps = {
  pageProps: PageContentProps
  rateType: MarketRateType
  previewPrices?: Range<Decimal> | undefined
}

/**
 * Reusable component for OHLC charts, Bands (if applicable), and market parameters, used in market and vault pages.
 */
export const MarketInformationComposite = ({ pageProps, rateType, previewPrices }: MarketInformationCompProps) => {
  const { rChainId, market, apiMarket } = pageProps
  const marketId = market?.id ?? '' // todo: get rid of this
  const api = getLib('llamaApi')
  const isBorrow = rateType === MarketRateType.Borrow
  const blockchainId = networks[rChainId].id as Chain

  const controllerAddress = getControllerAddress(market, apiMarket.data)
  const ammAddress = getAmmAddress(market, apiMarket.data)
  const { collateralToken, borrowToken } = getTokens(market, apiMarket.data) ?? {}
  return (
    <Stack sx={{ gap: PAGE_SPACING }}>
      {isBorrow && (
        <ChartAndActivityComp
          rChainId={rChainId}
          marketId={marketId}
          api={api}
          previewPrices={previewPrices}
          controllerAddress={controllerAddress}
          ammAddress={ammAddress}
          borrowToken={borrowToken}
          collateralToken={collateralToken}
        />
      )}
      {isBorrow && (
        <MarketHistoricalRatesChart
          marketType={LlamaMarketType.Lend}
          controllerAddress={controllerAddress}
          blockchainId={blockchainId}
          chainId={rChainId}
          marketId={marketId}
          rateMode={MarketRateType.Borrow}
        />
      )}
      <MarketHistoricalRatesChart
        marketType={LlamaMarketType.Lend}
        controllerAddress={controllerAddress}
        blockchainId={blockchainId}
        chainId={rChainId}
        marketId={marketId}
        rateMode={MarketRateType.Supply}
      />
      <MarketRateCurveChart
        collateralToken={collateralToken}
        borrowToken={borrowToken}
        controllerAddress={controllerAddress}
        blockchainId={blockchainId}
        chainId={rChainId}
        marketId={marketId}
        apiMarket={apiMarket}
      />
      <Card size="small">
        <CardHeader title={t`Advanced Details`} />
        <CardContent component={Stack}>
          <AdvancedDetails
            chainId={rChainId}
            marketId={marketId}
            market={market}
            marketType={LlamaMarketType.Lend}
            apiMarket={apiMarket}
          />
          <MarketInfoLayout
            chainId={rChainId}
            marketType={LlamaMarketType.Lend}
            market={market}
            apiMarket={apiMarket}
            network={networks[rChainId]}
          />
        </CardContent>
      </Card>

      <MarketFaq />
    </Stack>
  )
}
