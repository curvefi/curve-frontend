// TODO: refactor query into llamalend for both mint and lend markets
// eslint-disable-next-line import/no-restricted-paths
import { useMarketPricePerShare } from '@/lend/entities/market-details'
import { MarketLoanParameters } from '@/llamalend/features/market-parameters/MarketLoanParameters'
import { MarketPrices } from '@/llamalend/features/market-parameters/MarketPrices'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { CardHeader, Stack, Typography } from '@mui/material'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType } from '@ui-kit/types/market'

const { Spacing } = SizesAndSpaces

type MarketParametersSectionProps = {
  chainId: IChainId
  marketId: string
  marketType: LlamaMarketType
}

export const MarketParametersSection = ({ chainId, marketId, marketType }: MarketParametersSectionProps) => {
  const enablePricePerShare = marketType === LlamaMarketType.Lend
  const {
    data: pricePerShare,
    isLoading: isLoadingPricePerShare,
    error: errorPricePerShare,
  } = useMarketPricePerShare({ chainId, marketId }, enablePricePerShare)

  return (
    <Stack gap={Spacing.md}>
      <Stack gap={Spacing.xs}>
        <CardHeader title={t`Loan Parameters`} size="small" inline />
        <Stack>
          <MarketLoanParameters chainId={chainId} marketId={marketId} />
        </Stack>
      </Stack>

      <Stack gap={Spacing.xs}>
        <Typography variant="headingXsBold">{t`Prices`}</Typography>
        <Stack>
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

      <Stack gap={Spacing.xs}>
        <Typography variant="headingXsBold">{t`Market`}</Typography>
        <Stack>
          <ActionInfo label={t`ID`} value={marketId} loading={!marketId} />
        </Stack>
      </Stack>
    </Stack>
  )
}
