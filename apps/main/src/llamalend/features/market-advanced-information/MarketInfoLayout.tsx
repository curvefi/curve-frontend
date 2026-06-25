import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Stack from '@mui/material/Stack'
import { type BaseConfig } from '@ui/utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType } from '@ui-kit/types/market'
import type { QueryProp } from '@ui-kit/types/util'
import { MarketContractsSection } from './MarketContractsSection'
import { MarketParametersSection } from './MarketParametersSection'

const { Spacing, MaxWidth } = SizesAndSpaces

type MarketInfoSectionsProps = {
  chainId: IChainId
  marketType: LlamaMarketType
  market: LlamaMarketTemplate | undefined
  apiMarket: QueryProp<LlamaMarket>
  network: BaseConfig | undefined
}

export const MarketInfoLayout = ({ chainId, marketType, market, apiMarket, network }: MarketInfoSectionsProps) => (
  <Stack
    sx={{
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: Spacing.lg,
      backgroundColor: t => t.design.Layer[1].Fill,

      [`@media (min-width: ${MaxWidth.candleAndBandChart})`]: {
        gridTemplateColumns: '1fr 1fr',
      },
    }}
  >
    <MarketParametersSection chainId={chainId} marketId={market?.id} marketType={marketType} apiMarket={apiMarket} />
    <MarketContractsSection chainId={chainId} market={market} apiMarket={apiMarket} network={network} />
  </Stack>
)
