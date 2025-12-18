import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { type ExpandedPanel } from '@ui-kit/shared/ui/DataTable/ExpansionRow'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { ParsedUserCollateralEvent } from './hooks/useUserCollateralEvents'

const { Spacing } = SizesAndSpaces

export const RowExpandedPanel: ExpandedPanel<ParsedUserCollateralEvent> = ({ row: { original: event } }) => {
  const { txUrl, loanChange, borrowToken, collateralChange, collateralChangeUsd, collateralToken } = event

  return (
    <Stack>
      <Stack paddingTop={Spacing.md}>
        <Stack direction="row" justifyContent="space-between">
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
            {collateralChange === 0 ? '-' : formatNumber(collateralChange)}{' '}
            {collateralChange != null && collateralChange !== 0 && collateralChangeUsd !== 0 && collateralToken?.symbol}
          </Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="bodyMRegular" color="textSecondary">{t`Debt`}</Typography>
          <Typography
            variant="tableCellMBold"
            color={loanChange === 0 || loanChange == null ? 'textPrimary' : loanChange > 0 ? 'error' : 'success'}
          >
            {loanChange > 0 ? '+' : ''}
            {loanChange !== 0 ? formatNumber(loanChange) : '-'}{' '}
            {loanChange != null && loanChange !== 0 && borrowToken?.symbol}
          </Typography>
        </Stack>
      </Stack>

      {txUrl && (
        <Button
          component={Link}
          href={txUrl}
          target="_blank"
          rel="noreferrer"
          variant="link"
          color="ghost"
          size="extraSmall"
          endIcon={<ArrowOutwardIcon />}
        >
          {t`View Transaction`}
        </Button>
      )}
    </Stack>
  )
}
