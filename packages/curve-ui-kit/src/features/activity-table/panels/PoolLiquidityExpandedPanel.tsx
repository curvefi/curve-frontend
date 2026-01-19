import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber, shortenString } from '@ui-kit/utils'
import type { ExpandedPanel, PoolLiquidityRow } from '../types'

const { Spacing } = SizesAndSpaces

export const PoolLiquidityExpandedPanel: ExpandedPanel<PoolLiquidityRow> = ({ row: { original: event } }) => {
  const { url, tokenAmounts, provider } = event

  return (
    <Stack>
      <Stack paddingTop={Spacing.md} gap={Spacing.xs}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="bodyMRegular" color="textSecondary">{t`Amounts`}</Typography>
          <Typography variant="tableCellMBold">
            {tokenAmounts.map((amount) => formatNumber(amount, { abbreviate: false })).join(', ')}
          </Typography>
        </Stack>
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
