import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { type ExpandedPanel } from '@ui-kit/shared/ui/DataTable/ExpansionRow'
import { TableExpandedPanel } from '@ui-kit/shared/ui/DataTable/TableExpandedPanel'
import { ExternalLink } from '@ui-kit/shared/ui/ExternalLink'
import { formatNumber } from '@ui-kit/utils'
import type { ParsedUserCollateralEvent } from './hooks/useUserCollateralEvents'

export const RowExpandedPanel: ExpandedPanel<ParsedUserCollateralEvent> = ({ row: { original: event }, category }) => {
  const { url, loanChange, borrowToken, collateralChange, collateralChangeUsd, collateralToken } = event

  return (
    <TableExpandedPanel
      category={category}
      footer={url && <ExternalLink href={url} label={t`View Transaction`} size="extraSmall" />}
    >
      <Stack>
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography variant="bodyMRegular" color="textSecondary">{t`Collateral`}</Typography>
          <Typography
            variant="tableCellMBold"
            color={
              collateralChange === 0 || collateralChange == null
                ? 'textPrimary'
                : collateralChange > 0
                  ? 'success'
                  : 'error'
            }
          >
            {collateralChange > 0 ? '+' : ''}
            {collateralChange === 0 ? '-' : formatNumber(collateralChange, { abbreviate: false })}{' '}
            {collateralChange != null && collateralChange !== 0 && collateralChangeUsd !== 0 && collateralToken?.symbol}
          </Typography>
        </Stack>
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography variant="bodyMRegular" color="textSecondary">{t`Debt`}</Typography>
          <Typography
            variant="tableCellMBold"
            color={loanChange === 0 || loanChange == null ? 'textPrimary' : loanChange > 0 ? 'error' : 'success'}
          >
            {loanChange > 0 ? '+' : ''}
            {loanChange === 0 ? '-' : formatNumber(loanChange, { abbreviate: false })}{' '}
            {loanChange !== 0 && borrowToken?.symbol}
          </Typography>
        </Stack>
      </Stack>
    </TableExpandedPanel>
  )
}
