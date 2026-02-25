import { useMarketVaultPricePerShare } from '@/llamalend/queries/market'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { CardHeader, Stack } from '@mui/material'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType } from '@ui-kit/types/market'
import { MarketLoanParameters } from './MarketLoanParameters'
import { MarketPrices } from './MarketPrices'

const { Spacing } = SizesAndSpaces

type MarketParametersProps = {
  chainId: IChainId
  marketId: string | undefined
  marketType: LlamaMarketType
}

export const MarketParametersSection = ({ chainId, marketId, marketType }: MarketParametersProps) => {
  const enablePricePerShare = marketType === LlamaMarketType.Lend
  const {
    data: pricePerShare,
    isLoading: isLoadingPricePerShare,
    error: errorPricePerShare,
  } = useMarketVaultPricePerShare({ chainId, marketId }, enablePricePerShare)

  return (
    <Stack>
      <CardHeader title={t`Parameters`} size="small" data-inline />
      <Stack paddingBlock={Spacing.sm}>
        <MarketLoanParameters chainId={chainId} marketId={marketId} />
      </Stack>

      <Stack>
        <CardHeader title={t`Prices`} size="small" data-inline />
        <Stack paddingBlock={Spacing.sm}>
          <MarketPrices chainId={chainId} marketId={marketId} />
          {enablePricePerShare && (
            <ActionInfo
              label={t`Price per share`}
              value={formatNumber(pricePerShare, { decimals: 5 })}
              loading={isLoadingPricePerShare}
              error={errorPricePerShare}
            />
          )}
        </Stack>
      </Stack>

      <Stack>
        <CardHeader title={t`Market`} size="small" data-inline />
        <Stack paddingBlock={Spacing.sm}>
          <ActionInfo label={t`ID`} value={marketId} loading={!marketId} />
        </Stack>
      </Stack>
    </Stack>
  )
}
