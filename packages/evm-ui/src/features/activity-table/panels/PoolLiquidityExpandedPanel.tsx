import type { ExpandedPanelComponent } from '@evm-ui/shared/ui/DataTable/ExpansionRow'
import { formatNumber } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { shortenString } from '@primitives/string.utils'
import { TokenIcon } from '@ui/components/TokenIcon'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import type { PoolLiquidityRow } from '../types'

const { Spacing } = SizesAndSpaces

export const PoolLiquidityExpandedPanel: ExpandedPanelComponent<PoolLiquidityRow> = ({
  row: {
    original: { tokenAmounts, poolTokens, provider, blockchainId, eventType },
  },
}) => {
  const isAdd = eventType === 'AddLiquidity'

  // Filter out zero amounts
  const nonZeroAmounts = tokenAmounts
    .map((amount, index) => ({ amount, token: poolTokens[index] }))
    .filter(({ amount }) => amount !== 0)

  return (
    <Stack>
      {nonZeroAmounts.map(({ amount, token }, index) => (
        <Stack key={token.address} direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="bodyMRegular" color="textSecondary">
            {token?.symbol ?? `Token ${index}`}
          </Typography>
          <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xs }}>
            <Typography variant="tableCellMBold" color={isAdd ? 'success' : 'error'}>
              {formatNumber(amount, { abbreviate: false })}
            </Typography>
            <TokenIcon blockchainId={blockchainId} address={token?.address} size="mui-sm" />
          </Stack>
        </Stack>
      ))}
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="bodyMRegular" color="textSecondary">{t`User`}</Typography>
        <Typography variant="tableCellMBold">{shortenString(provider)}</Typography>
      </Stack>
    </Stack>
  )
}
