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
import type { TradeRow } from '../hooks/useLlammaActivity'

const { Spacing } = SizesAndSpaces

export const TradesExpandedPanel: ExpandedPanel<TradeRow> = ({ row: { original: trade } }) => {
  const { url, amountSold, tokenSold, buyer, network } = trade

  return (
    <Stack>
      <Stack paddingTop={Spacing.md} gap={Spacing.xs}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="bodyMRegular" color="textSecondary">{t`Sold`}</Typography>
          <Stack direction="row" alignItems="center" gap={Spacing.xs}>
            <Typography variant="tableCellMBold" color="error">
              -{formatNumber(amountSold, { abbreviate: false })} {tokenSold.symbol}
            </Typography>
            <TokenIcon blockchainId={network} address={tokenSold.address} size="mui-sm" />
          </Stack>
        </Stack>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="bodyMRegular" color="textSecondary">{t`User`}</Typography>
          <Typography variant="tableCellMBold">{shortenString(buyer, { digits: 4 })}</Typography>
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
