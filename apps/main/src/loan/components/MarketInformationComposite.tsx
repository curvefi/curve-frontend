import { AdvancedDetails, MarketInfoLayout } from '@/llamalend/features/market-advanced-information'
import { MarketFaq } from '@/llamalend/features/market-faq'
import { getAmmAddress, getControllerAddress, getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { CrvUsdPriceChart } from '@/llamalend/widgets/CrvUsdPriceChart'
import { MarketHistoricalRatesChart } from '@/llamalend/widgets/MarketHistoricalRatesChart'
import { ChartAndActivityComp } from '@/loan/components/ChartAndActivityComp'
import type { ChainId, Llamma } from '@/loan/types/loan.types'
import type { Chain } from '@curvefi/prices-api'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { LlamaMarketType, MarketRateType } from '@ui-kit/types/market'
import type { QueryProp, Range } from '@ui-kit/types/util'
import { PAGE_SPACING } from '@ui-kit/widgets/DetailPageLayout/constants'
import { networks } from '../networks'

type MarketInformationCompProps = {
  market: Llamma | null
  marketId: string
  chainId: ChainId
  previewPrices: Range<Decimal> | undefined
  apiMarket: QueryProp<LlamaMarket>
}

export const MarketInformationComposite = ({
  market,
  marketId,
  chainId,
  previewPrices,
  apiMarket,
}: MarketInformationCompProps) => {
  const controllerAddress = getControllerAddress(market) ?? apiMarket.data?.controllerAddress
  const ammAddress = getAmmAddress(market) ?? apiMarket.data?.ammAddress
  const { collateralToken, borrowToken } =
    maybe(market, getTokens) ??
    maybe(apiMarket.data, ({ assets }) => ({ collateralToken: assets.collateral, borrowToken: assets.borrowed })) ??
    {}
  const blockchainId = networks[chainId].id as Chain

  return (
    <Stack sx={{ gap: PAGE_SPACING }}>
      <ChartAndActivityComp
        chainId={chainId}
        marketId={marketId}
        previewPrices={previewPrices}
        controllerAddress={controllerAddress}
        ammAddress={ammAddress}
        borrowToken={borrowToken}
        collateralToken={collateralToken}
      />
      <MarketHistoricalRatesChart
        marketType={LlamaMarketType.Mint}
        controllerAddress={controllerAddress}
        blockchainId={blockchainId}
        chainId={chainId}
        marketId={marketId}
        rateMode={MarketRateType.Borrow}
      />
      <CrvUsdPriceChart />

      {!apiMarket.data && (
        <Card size="small">
          <CardHeader title={t`Advanced Details`} />
          <CardContent component={Stack}>
            <AdvancedDetails
              chainId={chainId}
              marketId={marketId}
              market={market ?? undefined}
              marketType={LlamaMarketType.Mint}
            />
            <MarketInfoLayout
              chainId={chainId}
              marketType={LlamaMarketType.Mint}
              market={market ?? undefined}
              network={networks[chainId]}
            />
          </CardContent>
        </Card>
      )}

      <MarketFaq />
    </Stack>
  )
}
