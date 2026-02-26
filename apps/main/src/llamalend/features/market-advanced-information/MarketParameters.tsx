// TODO: refactor query into llamalend for both mint and lend markets
// eslint-disable-next-line import/no-restricted-paths
import { useMarketPricePerShare } from '@/lend/entities/market-details'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { Typography } from '@mui/material'
import Stack from '@mui/material/Stack'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { MarketLoanParameters } from './MarketLoanParameters'
import { MarketPrices } from './MarketPrices'

const { Spacing } = SizesAndSpaces

/**
 * Legacy component kept for `LoanFormCreate` accordions.
 * Market information pages should use `llamalend/widgets/market-info-sections` instead.
 *
 * @deprecated Use `llamalend/widgets/market-info-sections` for new market information pages.
 */
export const MarketParameters = ({
  chainId,
  marketId,
  marketType,
  action,
}: {
  chainId: IChainId
  marketId: string
  marketType: 'lend' | 'mint'
  action: 'borrow' | 'supply'
}) => {
  const enablePricePerShare = marketType === 'lend' && action === 'supply'
  const {
    data: pricePerShare,
    isLoading: isLoadingPricePerShare,
    error: errorPricePerShare,
  } = useMarketPricePerShare({ chainId, marketId }, enablePricePerShare)

  return (
    <Stack
      gap={Spacing.md}
      sx={{ backgroundColor: (t) => t.design.Layer[2].Fill, padding: Spacing.md, minWidth: '18.75rem' }}
    >
      {action === 'borrow' && (
        <Stack gap={Spacing.xs}>
          <Typography variant="headingXsBold">{t`Loan Parameters`}</Typography>
          <Stack>
            <MarketLoanParameters chainId={chainId} marketId={marketId} />
          </Stack>
        </Stack>
      )}

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
