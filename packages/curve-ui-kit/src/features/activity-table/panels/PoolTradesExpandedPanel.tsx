import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber, shortenString } from '@ui-kit/utils'
import type { ExpandedPanel, PoolTradeRow } from '../types'

const { Spacing } = SizesAndSpaces

export const PoolTradesExpandedPanel: ExpandedPanel<PoolTradeRow> = ({ row: { original: trade } }) => {
  const { txUrl, tokensSold, tokenSold, buyer, network } = trade

  return (
    <Stack>
      <Stack paddingTop={Spacing.md} gap={Spacing.xs}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="bodyMRegular" color="textSecondary">{t`Sold`}</Typography>
          <Stack direction="row" alignItems="center" gap={Spacing.xs}>
            <Typography variant="tableCellMBold" color="error">
              -{formatNumber(tokensSold, { abbreviate: false })} {tokenSold.symbol}
            </Typography>
            <TokenIcon blockchainId={network} address={tokenSold.address} size="mui-sm" />
          </Stack>
        </Stack>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="bodyMRegular" color="textSecondary">{t`User`}</Typography>
          <Typography variant="tableCellMBold">{shortenString(buyer, { digits: 4 })}</Typography>
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
