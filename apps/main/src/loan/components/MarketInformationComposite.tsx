import { AdvancedDetails, MarketInfoLayout } from '@/llamalend/features/market-advanced-information'
import { CrvUsdPriceChart } from '@/llamalend/widgets/CrvUsdPriceChart'
import { MarketHistoricalRatesChart } from '@/llamalend/widgets/MarketHistoricalRatesChart'
import { ChartAndActivityComp } from '@/loan/components/ChartAndActivityComp'
import type { ChainId, Llamma } from '@/loan/types/loan.types'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import { LlamaMarketType } from '@ui-kit/types/market'
import type { Range } from '@ui-kit/types/util'
import { BlockchainIds, Chain } from '@ui-kit/utils/network'
import { PAGE_SPACING } from '@ui-kit/widgets/DetailPageLayout/constants'
import { networks } from '../networks'

type MarketInformationCompProps = {
  market: Llamma | null
  marketId: string
  chainId: ChainId
  previewPrices: Range<Decimal> | undefined
}

export const MarketInformationComposite = ({
  market,
  marketId,
  chainId,
  previewPrices,
}: MarketInformationCompProps) => (
  <Stack gap={PAGE_SPACING}>
    <ChartAndActivityComp chainId={chainId} marketId={marketId} market={market} previewPrices={previewPrices} />
    <MarketHistoricalRatesChart market={market} blockchainId={BlockchainIds[Chain.Ethereum]} rateMode="borrow" />
    <CrvUsdPriceChart />

    <Card size="small">
      <CardHeader title={t`Advanced Details`} />
      <CardContent component={Stack}>
        <AdvancedDetails
          chainId={chainId}
          marketId={marketId}
          market={market || undefined}
          marketType={LlamaMarketType.Mint}
        />
        <MarketInfoLayout
          chainId={chainId}
          marketType={LlamaMarketType.Mint}
          market={market || undefined}
          network={networks[chainId]}
        />
      </CardContent>
    </Card>
  </Stack>
)
