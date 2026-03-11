import { MarketInfoLayout, AdvancedDetails } from '@/llamalend/features/market-advanced-information'
import { BandsComp } from '@/loan/components/BandsComp'
import { ChartAndActivityComp } from '@/loan/components/ChartAndActivityComp'
import type { ChainId, Llamma } from '@/loan/types/loan.types'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { useNewBandsChart } from '@ui-kit/hooks/useFeatureFlags'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType } from '@ui-kit/types/market'
import type { Range } from '@ui-kit/types/util'
import { networks } from '../networks'

const { Spacing } = SizesAndSpaces

type MarketInformationCompProps = {
  market: Llamma | null
  marketId: string
  chainId: ChainId
  page?: 'create' | 'manage'
  previewPrices: Range<Decimal> | undefined
}

export const MarketInformationComposite = ({
  market,
  marketId,
  chainId,
  page = 'manage',
  previewPrices,
}: MarketInformationCompProps) => {
  const newBandsChartEnabled = useNewBandsChart()

  return (
    <>
      <ChartAndActivityComp chainId={chainId} marketId={marketId} market={market} previewPrices={previewPrices} />
      {!newBandsChartEnabled && (
        <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, padding: Spacing.md }}>
          <BandsComp market={market} marketId={marketId} page={page} />
        </Stack>
      )}
      {market && (
        <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
          <AdvancedDetails chainId={chainId} marketId={marketId} market={market} marketType={LlamaMarketType.Mint} />
          <MarketInfoLayout
            chainId={chainId}
            marketType={LlamaMarketType.Mint}
            market={market}
            network={networks[chainId]}
          />
        </Stack>
      )}
    </>
  )
}
