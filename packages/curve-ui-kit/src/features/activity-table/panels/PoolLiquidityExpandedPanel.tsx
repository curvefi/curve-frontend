import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import type { ExpandedPanel } from '@ui-kit/shared/ui/DataTable/ExpansionRow'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber, shortenString } from '@ui-kit/utils'
import type { PoolLiquidityRow } from '../types'

const { Spacing } = SizesAndSpaces

export const PoolLiquidityExpandedPanel: ExpandedPanel<PoolLiquidityRow> = ({
  row: {
    original: { txUrl, tokenAmounts, poolTokens, provider, network, eventType },
  },
}) => {
  const isAdd = eventType === 'AddLiquidity'

  // Filter out zero amounts
  const nonZeroAmounts = tokenAmounts
    .map((amount, index) => ({ amount, token: poolTokens[index] }))
    .filter(({ amount }) => amount !== 0)

  return (
    <Stack>
      <Stack paddingTop={Spacing.md} gap={Spacing.xs}>
        {nonZeroAmounts.map(({ amount, token }, index) => (
          <Stack key={token?.address ?? index} direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="bodyMRegular" color="textSecondary">
              {token?.symbol ?? `Token ${index}`}
            </Typography>
            <Stack direction="row" alignItems="center" gap={Spacing.xs}>
              <Typography variant="tableCellMBold" color={isAdd ? 'success' : 'error'}>
                {formatNumber(amount, { abbreviate: false })}
              </Typography>
              <TokenIcon blockchainId={network} address={token?.address} size="mui-sm" />
            </Stack>
          </Stack>
        ))}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="bodyMRegular" color="textSecondary">{t`User`}</Typography>
          <Typography variant="tableCellMBold">{shortenString(provider)}</Typography>
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
