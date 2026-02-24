import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Stack from '@mui/material/Stack'
import { type BaseConfig } from '@ui/utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType } from '@ui-kit/types/market'
import { MarketContractsSection } from './MarketContractsSection'
import { MarketParametersSection } from './MarketParametersSection'

const { Spacing, MaxWidth } = SizesAndSpaces

type MarketInfoSectionsProps = {
  chainId: IChainId
  marketId: string
  marketType: LlamaMarketType
  market: LlamaMarketTemplate | undefined
  network: BaseConfig | undefined
}

export const MarketInfoSections = ({ chainId, marketId, marketType, market, network }: MarketInfoSectionsProps) => (
  <Stack
    sx={{
      flexDirection: 'column',
      gap: Spacing.lg,
      paddingInline: Spacing.md,
      paddingBottom: Spacing.md,
      [`@media (min-width: ${MaxWidth.candleAndBandChart})`]: {
        flexDirection: 'row',
      },
    }}
  >
    <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
      <MarketContractsSection chainId={chainId} market={market} network={network} />
    </Stack>
    <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
      <MarketParametersSection chainId={chainId} marketId={marketId} marketType={marketType} />
    </Stack>
  </Stack>
)
