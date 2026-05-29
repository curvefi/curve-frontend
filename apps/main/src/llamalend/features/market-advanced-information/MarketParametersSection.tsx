import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { CardHeader, Stack } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType } from '@ui-kit/types/market'
import { MarketLoanParameters } from './MarketLoanParameters'
import { MarketIdRow, MarketPricesRows } from './MarketParameterRows'

const { Spacing } = SizesAndSpaces

interface MarketParametersProps {
  chainId: IChainId
  marketId: string | undefined
  marketType: LlamaMarketType
}

export const MarketParametersSection = ({ chainId, marketId, marketType }: MarketParametersProps) => {
  const enablePricePerShare = marketType === LlamaMarketType.Lend

  return (
    <Stack>
      <Stack sx={{ gap: Spacing.sm }}>
        <CardHeader title={t`Parameters`} size="inline" />
        <Stack>
          <MarketLoanParameters chainId={chainId} marketId={marketId} />
        </Stack>
      </Stack>
      <Stack sx={{ gap: Spacing.sm }}>
        <CardHeader title={t`Prices`} size="inline" />
        <Stack>
          <MarketPricesRows chainId={chainId} marketId={marketId} enablePricePerShare={enablePricePerShare} />
        </Stack>
      </Stack>
      <Stack sx={{ gap: Spacing.sm }}>
        <CardHeader title={t`Market`} size="inline" />
        <Stack>
          <MarketIdRow marketId={marketId} />
        </Stack>
      </Stack>
    </Stack>
  )
}
