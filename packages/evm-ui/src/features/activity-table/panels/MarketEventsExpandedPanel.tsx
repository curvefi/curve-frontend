import type { ExpandedPanelComponent } from '@evm-ui/shared/ui/DataTable/ExpansionRow'
import { formatNumber } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { shortenString } from '@primitives/string.utils'
import { TokenIcon } from '@ui/components/TokenIcon'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import type { MarketEventRow } from '../types'

const { Spacing } = SizesAndSpaces

export const MarketEventsExpandedPanel: ExpandedPanelComponent<MarketEventRow> = ({
  row: {
    original: { deposit, withdrawal, provider, blockchainId, collateralToken, borrowToken },
  },
}) => (
  <Stack>
    {deposit && (
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="bodyMRegular" color="textSecondary">{t`Amount`}</Typography>
        <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xs }}>
          <Typography variant="tableCellMBold" color="success">
            {formatNumber(deposit.amount, { abbreviate: false })} {collateralToken?.symbol}
          </Typography>
          {collateralToken && <TokenIcon blockchainId={blockchainId} address={collateralToken.address} size="mui-sm" />}
        </Stack>
      </Stack>
    )}
    {withdrawal && (
      <>
        {withdrawal.amountCollateral !== 0 && (
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="bodyMRegular" color="textSecondary">{t`Collateral`}</Typography>
            <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xs }}>
              <Typography variant="tableCellMBold" color="error">
                {formatNumber(withdrawal.amountCollateral, { abbreviate: false })} {collateralToken?.symbol}
              </Typography>
              {collateralToken && (
                <TokenIcon blockchainId={blockchainId} address={collateralToken.address} size="mui-sm" />
              )}
            </Stack>
          </Stack>
        )}
        {withdrawal.amountBorrowed !== 0 && (
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="bodyMRegular" color="textSecondary">{t`Borrowed`}</Typography>
            <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xs }}>
              <Typography variant="tableCellMBold" color="error">
                {formatNumber(withdrawal.amountBorrowed, { abbreviate: false })} {borrowToken?.symbol}
              </Typography>
              {borrowToken && <TokenIcon blockchainId={blockchainId} address={borrowToken.address} size="mui-sm" />}
            </Stack>
          </Stack>
        )}
      </>
    )}
    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="bodyMRegular" color="textSecondary">{t`User`}</Typography>
      <Typography variant="tableCellMBold">{shortenString(provider)}</Typography>
    </Stack>
  </Stack>
)
