import { AdvancedDetails, MarketInfoLayout } from '@/llamalend/features/market-advanced-information'
import { MarketFaq } from '@/llamalend/features/market-faq'
import { getAmmAddress, getControllerAddress, getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { CrvUsdPriceChart } from '@/llamalend/widgets/CrvUsdPriceChart'
import { MarketHistoricalRatesChart } from '@/llamalend/widgets/MarketHistoricalRatesChart'
import { ChartAndActivityComp } from '@/loan/components/ChartAndActivityComp'
import type { ChainId, Llamma } from '@/loan/types/loan.types'
import { getBlockchainId } from '@curvefi/prices-api'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
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
  const controllerAddress = getControllerAddress(market, apiMarket.data)
  const { collateralToken, borrowToken } = getTokens(market, apiMarket.data) ?? {}
  return (
    <Stack sx={{ gap: PAGE_SPACING }}>
      <ChartAndActivityComp
        chainId={chainId}
        marketId={marketId}
        previewPrices={previewPrices}
        controllerAddress={controllerAddress}
        ammAddress={getAmmAddress(market, apiMarket.data)}
        borrowToken={borrowToken}
        collateralToken={collateralToken}
      />
      <MarketHistoricalRatesChart
        marketType={LlamaMarketType.Mint}
        controllerAddress={controllerAddress}
        blockchainId={getBlockchainId(networks[chainId].id)}
        chainId={chainId}
        marketId={marketId}
        rateMode={MarketRateType.Borrow}
      />
      <CrvUsdPriceChart />

      <Card size="small">
        <CardHeader title={t`Advanced Details`} />
        <CardContent component={Stack}>
          <AdvancedDetails
            chainId={chainId}
            marketId={marketId}
            market={market ?? undefined}
            marketType={LlamaMarketType.Mint}
            apiMarket={apiMarket}
          />
          <MarketInfoLayout
            chainId={chainId}
            marketType={LlamaMarketType.Mint}
            market={market ?? undefined}
            apiMarket={apiMarket}
            network={networks[chainId]}
          />
        </CardContent>
      </Card>

      <MarketFaq />
    </Stack>
  )
}
