import { MarketInfoLayout, AdvancedDetails } from '@/llamalend/features/market-advanced-information'
import { CrvUsdPriceChart } from '@/llamalend/widgets/CrvUsdPriceChart'
import { MarketHistoricalRatesChart } from '@/llamalend/widgets/MarketHistoricalRatesChart'
import { BandsComp } from '@/loan/components/BandsComp'
import { ChartAndActivityComp } from '@/loan/components/ChartAndActivityComp'
import type { ChainId, Llamma } from '@/loan/types/loan.types'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { useNewBandsChart, useMarketHistoricalRatesChart } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType } from '@ui-kit/types/market'
import type { Range } from '@ui-kit/types/util'
import { BlockchainIds, Chain } from '@ui-kit/utils/network'
import { PAGE_SPACING } from '@ui-kit/widgets/DetailPageLayout/constants'
import { networks } from '../networks'

const { Spacing } = SizesAndSpaces

type MarketInformationCompProps = {
  market: Llamma | null
  chainId: ChainId
  page?: 'create' | 'manage'
  previewPrices: Range<Decimal> | undefined
}

export const MarketInformationComposite = ({
  market,
  chainId,
  page = 'manage',
  previewPrices,
}: MarketInformationCompProps) => {
  const newBandsChartEnabled = useNewBandsChart()

  return (
    <Stack gap={PAGE_SPACING}>
      <ChartAndActivityComp chainId={chainId} market={market} previewPrices={previewPrices} />
      {!newBandsChartEnabled && (
        <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, padding: Spacing.md }}>
          <BandsComp market={market} page={page} />
        </Stack>
      )}
      {useMarketHistoricalRatesChart() && (
        <>
          <MarketHistoricalRatesChart market={market} blockchainId={BlockchainIds[Chain.Ethereum]} rateMode="borrow" />
          <CrvUsdPriceChart />
        </>
      )}
      {market && (
        <Card>
          <CardHeader title={t`Advanced Details`} size="small" />
          <CardContent>
            <Stack>
              <AdvancedDetails chainId={chainId} market={market} marketType={LlamaMarketType.Mint} />
              <MarketInfoLayout
                chainId={chainId}
                marketType={LlamaMarketType.Mint}
                market={market}
                network={networks[chainId]}
              />
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  )
}
