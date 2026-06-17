import { AdvancedDetails, MarketInfoLayout } from '@/llamalend/features/market-advanced-information'
import { MarketFaq } from '@/llamalend/features/market-faq'
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
import { LlamaMarketType, MarketRateType } from '@ui-kit/types/market'
import type { QueryProp, Range } from '@ui-kit/types/util'
import { BlockchainIds, Chain } from '@ui-kit/utils/network'
import { PAGE_SPACING } from '@ui-kit/widgets/DetailPageLayout/constants'
import { networks } from '../networks'

type MarketInformationCompProps = {
  marketQuery: QueryProp<Llamma>
  chainId: ChainId
  previewPrices: Range<Decimal> | undefined
}

export const MarketInformationComposite = ({ marketQuery, chainId, previewPrices }: MarketInformationCompProps) => {
  const { data: market } = marketQuery

  return (
    <Stack sx={{ gap: PAGE_SPACING }}>
      <ChartAndActivityComp chainId={chainId} marketQuery={marketQuery} previewPrices={previewPrices} />
      <MarketHistoricalRatesChart
        market={market}
        blockchainId={BlockchainIds[Chain.Ethereum]}
        chainId={chainId}
        rateMode={MarketRateType.Borrow}
      />
      <CrvUsdPriceChart />

      <Card size="small">
        <CardHeader title={t`Advanced Details`} />
        <CardContent component={Stack}>
          <AdvancedDetails chainId={chainId} market={market} marketType={LlamaMarketType.Mint} />
          <MarketInfoLayout
            chainId={chainId}
            marketType={LlamaMarketType.Mint}
            market={market}
            network={networks[chainId]}
          />
        </CardContent>
      </Card>

      <MarketFaq />
    </Stack>
  )
}
