import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import Stack from '@mui/material/Stack'
import { useMarketContext } from '../market-context'
import { MarketContractsSection } from './MarketContractsSection'
import { MarketParametersSection } from './MarketParametersSection'

const { Spacing, MaxWidth } = SizesAndSpaces

export const MarketInfoLayout = () => {
  const { chainId, blockchainId, marketType, market, apiMarket } = useMarketContext()

  return (
    <Stack
      data-testid="market-advanced-details"
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
      <MarketContractsSection chainId={chainId} blockchainId={blockchainId} market={market} apiMarket={apiMarket} />
    </Stack>
  )
}
