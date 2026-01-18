import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { type ExpandedPanel } from '@ui-kit/features/activity-table'
import { t } from '@ui-kit/lib/i18n'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber, shortenString } from '@ui-kit/utils'
import type { EventRow } from '../hooks/useLlammaActivity'

const { Spacing } = SizesAndSpaces

export const EventsExpandedPanel: ExpandedPanel<EventRow> = ({ row: { original: event } }) => {
  const { url, deposit, withdrawal, provider, network, collateralToken, borrowToken } = event

  return (
    <Stack>
      <Stack paddingTop={Spacing.md} gap={Spacing.xs}>
        {deposit && (
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="bodyMRegular" color="textSecondary">{t`Amount`}</Typography>
            <Stack direction="row" alignItems="center" gap={Spacing.xs}>
              <Typography variant="tableCellMBold" color="success">
                +{formatNumber(deposit.amount, { abbreviate: false })} {collateralToken?.symbol}
              </Typography>
              {collateralToken && (
                <TokenIcon blockchainId={network} address={collateralToken.address} size="mui-sm" />
              )}
            </Stack>
          </Stack>
        )}
        {withdrawal && (
          <>
            {withdrawal.amountCollateral !== 0 && (
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="bodyMRegular" color="textSecondary">{t`Collateral`}</Typography>
                <Stack direction="row" alignItems="center" gap={Spacing.xs}>
                  <Typography variant="tableCellMBold" color="error">
                    -{formatNumber(withdrawal.amountCollateral, { abbreviate: false })} {collateralToken?.symbol}
                  </Typography>
                  {collateralToken && (
                    <TokenIcon blockchainId={network} address={collateralToken.address} size="mui-sm" />
                  )}
                </Stack>
              </Stack>
            )}
            {withdrawal.amountBorrowed !== 0 && (
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="bodyMRegular" color="textSecondary">{t`Borrowed`}</Typography>
                <Stack direction="row" alignItems="center" gap={Spacing.xs}>
                  <Typography variant="tableCellMBold" color="error">
                    -{formatNumber(withdrawal.amountBorrowed, { abbreviate: false })} {borrowToken?.symbol}
                  </Typography>
                  {borrowToken && (
                    <TokenIcon blockchainId={network} address={borrowToken.address} size="mui-sm" />
                  )}
                </Stack>
              </Stack>
            )}
          </>
        )}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="bodyMRegular" color="textSecondary">{t`User`}</Typography>
          <Typography variant="tableCellMBold">{shortenString(provider, { digits: 4 })}</Typography>
        </Stack>
      </Stack>

      {url && (
        <Button
          component={Link}
          href={url}
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
