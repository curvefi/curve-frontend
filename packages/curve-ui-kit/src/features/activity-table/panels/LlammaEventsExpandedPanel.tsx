import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { shortenString } from '@primitives/string.utils'
import { t } from '@ui-kit/lib/i18n'
import type { ExpandedPanel } from '@ui-kit/shared/ui/DataTable/ExpansionRow'
import { TableExpandedPanel } from '@ui-kit/shared/ui/DataTable/TableExpandedPanel'
import { ExternalLink } from '@ui-kit/shared/ui/ExternalLink'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'
import type { LlammaEventRow } from '../types'

const { Spacing } = SizesAndSpaces

export const LlammaEventsExpandedPanel: ExpandedPanel<LlammaEventRow> = ({
  row: {
    original: { txUrl, deposit, withdrawal, provider, network, collateralToken, borrowToken },
  },
  category,
}) => (
  <TableExpandedPanel
    category={category}
    footer={txUrl && <ExternalLink href={txUrl} label={t`View Transaction`} size="extraSmall" />}
  >
    <Stack>
      {deposit && (
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="bodyMRegular" color="textSecondary">{t`Amount`}</Typography>
          <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xs }}>
            <Typography variant="tableCellMBold" color="success">
              {formatNumber(deposit.amount, { abbreviate: false })} {collateralToken?.symbol}
            </Typography>
            {collateralToken && <TokenIcon blockchainId={network} address={collateralToken.address} size="mui-sm" />}
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
                  <TokenIcon blockchainId={network} address={collateralToken.address} size="mui-sm" />
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
                {borrowToken && <TokenIcon blockchainId={network} address={borrowToken.address} size="mui-sm" />}
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
  </TableExpandedPanel>
)
