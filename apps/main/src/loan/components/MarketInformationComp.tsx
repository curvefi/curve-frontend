import { MarketInfoSections, AdvancedDetails } from '@/llamalend/features/market-advanced-information'
import { BandsComp } from '@/loan/components/BandsComp'
import { ChartAndActivityComp } from '@/loan/components/ChartAndActivityComp'
import type { ChainId, Llamma } from '@/loan/types/loan.types'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useNewBandsChart, useIntegratedLlamaHeader } from '@ui-kit/hooks/useFeatureFlags'
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

/**
 * Reusable component for OHLC charts, Bands, and market parameters. For /create and /manage pages.
 */
export const MarketInformationComp = ({
  market,
  marketId,
  chainId,
  page = 'manage',
  previewPrices,
}: MarketInformationCompProps) => {
  const newBandsChartEnabled = useNewBandsChart()
  const showPageHeader = useIntegratedLlamaHeader()
  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

  return (
    <>
      <ChartAndActivityComp chainId={chainId} marketId={marketId} market={market} previewPrices={previewPrices} />
      {isAdvancedMode && !newBandsChartEnabled && (
        <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, gap: Spacing.md, padding: Spacing.md }}>
          <BandsComp market={market} marketId={marketId} page={page} />
        </Stack>
      )}
      {market && (isAdvancedMode || showPageHeader) && (
        <Stack
          sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, ...(showPageHeader && { marginTop: Spacing.md }) }}
        >
          {showPageHeader && (
            <AdvancedDetails chainId={chainId} marketId={marketId} market={market} marketType={LlamaMarketType.Mint} />
          )}
          <MarketInfoSections
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
