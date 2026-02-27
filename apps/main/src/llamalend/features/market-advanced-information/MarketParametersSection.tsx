import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { CardHeader, Stack } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType } from '@ui-kit/types/market'
import { MarketLoanParameters } from './MarketLoanParameters'
import { MarketIdRow, MarketPricesRows } from './MarketParameterRows'

const { Spacing } = SizesAndSpaces

type MarketParametersProps = {
  chainId: IChainId
  marketId: string | undefined
  marketType: LlamaMarketType
}

export const MarketParametersSection = ({ chainId, marketId, marketType }: MarketParametersProps) => {
  const enablePricePerShare = marketType === LlamaMarketType.Lend

  return (
    <Stack>
      <CardHeader title={t`Parameters`} size="small" data-inline />
      <Stack paddingBlock={Spacing.sm}>
        <MarketLoanParameters chainId={chainId} marketId={marketId} />
      </Stack>

      <Stack>
        <CardHeader title={t`Prices`} size="small" data-inline />
        <Stack paddingBlock={Spacing.sm}>
          <MarketPricesRows chainId={chainId} marketId={marketId} enablePricePerShare={enablePricePerShare} />
        </Stack>
      </Stack>

      <Stack>
        <CardHeader title={t`Market`} size="small" data-inline />
        <Stack paddingBlock={Spacing.sm}>
          <MarketIdRow marketId={marketId} />
        </Stack>
      </Stack>
    </Stack>
  )
}
