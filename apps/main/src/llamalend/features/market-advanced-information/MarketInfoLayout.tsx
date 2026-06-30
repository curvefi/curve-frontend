import Stack from '@mui/material/Stack'
import { type BaseConfig } from '@ui/utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useMarketContext } from '../market-context'
import { MarketContractsSection } from './MarketContractsSection'
import { MarketParametersSection } from './MarketParametersSection'

const { Spacing, MaxWidth } = SizesAndSpaces

type MarketInfoSectionsProps = {
  network: BaseConfig | undefined
}

export const MarketInfoLayout = ({ network }: MarketInfoSectionsProps) => {
  const { chainId, marketType, market, apiMarket } = useMarketContext()

  return (
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
}
