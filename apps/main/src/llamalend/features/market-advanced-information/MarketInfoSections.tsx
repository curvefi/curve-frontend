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
  marketType: LlamaMarketType
  market: LlamaMarketTemplate | undefined
  network: BaseConfig | undefined
}

export const MarketInfoSections = ({ chainId, marketType, market, network }: MarketInfoSectionsProps) => (
  <Stack
    display="grid"
    gridTemplateColumns="1fr"
    gap={Spacing.lg}
    paddingInline={Spacing.md}
    paddingBottom={Spacing.md}
    sx={{
      [`@media (min-width: ${MaxWidth.candleAndBandChart})`]: {
        gridTemplateColumns: '1fr 1fr',
      },
    }}
  >
    <MarketContractsSection chainId={chainId} market={market} network={network} />
    <MarketParametersSection chainId={chainId} marketId={market?.id} marketType={marketType} />
  </Stack>
)
