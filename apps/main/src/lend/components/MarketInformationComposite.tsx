import { ChartAndActivityComp } from '@/lend/components/ChartAndActivityComp'
import { networks } from '@/lend/networks'
import { PageContentProps } from '@/lend/types/lend.types'
import { AdvancedDetails, MarketInfoLayout } from '@/llamalend/features/market-advanced-information'
import { MarketFaq } from '@/llamalend/features/market-faq'
import { getAmmAddress, getControllerAddress, getTokens } from '@/llamalend/llama.utils'
import { MarketHistoricalRatesChart } from '@/llamalend/widgets/MarketHistoricalRatesChart'
import { MarketRateCurveChart } from '@/llamalend/widgets/MarketRateCurveChart'
import { getBlockchainId } from '@curvefi/prices-api'
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
  previewPrices?: Range<Decimal> | undefined
}

/**
 * Reusable component for OHLC charts, Bands (if applicable), and market parameters, used in market and vault pages.
 */
export const MarketInformationComposite = ({ pageProps, rateType, previewPrices }: MarketInformationCompProps) => {
  const { rChainId, market, apiMarket } = pageProps
  const blockchainId = getBlockchainId(networks[rChainId].id)
  const controllerAddress = getControllerAddress(market, apiMarket.data)
  const { collateralToken, borrowToken } = getTokens(market, apiMarket.data) ?? {}
  return (
    <Stack sx={{ gap: PAGE_SPACING }}>
      {rateType === MarketRateType.Borrow && (
        <>
          <ChartAndActivityComp
            rChainId={rChainId}
            marketId={market?.id}
            previewPrices={previewPrices}
            controllerAddress={controllerAddress}
            ammAddress={getAmmAddress(market, apiMarket.data)}
            borrowToken={borrowToken}
            collateralToken={collateralToken}
          />
          <MarketHistoricalRatesChart
            marketType={LlamaMarketType.Lend}
            controllerAddress={controllerAddress}
            blockchainId={blockchainId}
            chainId={rChainId}
            marketId={market?.id}
            rateMode={MarketRateType.Borrow}
            apiMarket={apiMarket}
          />
        </>
      )}
      <MarketHistoricalRatesChart
        marketType={LlamaMarketType.Lend}
        controllerAddress={controllerAddress}
        blockchainId={blockchainId}
        chainId={rChainId}
        marketId={market?.id}
        rateMode={MarketRateType.Supply}
        apiMarket={apiMarket}
      />
      <MarketRateCurveChart
        collateralToken={collateralToken}
        borrowToken={borrowToken}
        controllerAddress={controllerAddress}
        blockchainId={blockchainId}
        chainId={rChainId}
        marketId={market?.id}
        apiMarket={apiMarket}
      />
      <Card size="small">
        <CardHeader title={t`Advanced Details`} />
        <CardContent component={Stack}>
          <AdvancedDetails
            chainId={rChainId}
            marketId={market?.id}
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
