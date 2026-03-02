import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { Typography } from '@mui/material'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { MarketLoanParameters } from './MarketLoanParameters'
import { MarketIdRow, MarketPricesRows } from './MarketParameterRows'

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
          <MarketPricesRows chainId={chainId} marketId={marketId} enablePricePerShare={enablePricePerShare} />
        </Stack>
      </Stack>

      <Stack gap={Spacing.xs}>
        <Typography variant="headingXsBold">{t`Market`}</Typography>
        <Stack>
          <MarketIdRow marketId={marketId} />
        </Stack>
      </Stack>
    </Stack>
  )
}
