import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Address } from '@primitives/address.utils'
import { formatNumber } from '@primitives/number.utils'
import type { Nullish } from '@primitives/objects.utils'
import { TokenIcon, type Size } from '@ui/components/TokenIcon'
import { Tooltip } from '@ui/components/Tooltip'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import { q } from '@ui/features/queries/util'
import { QueryCell } from '@ui/features/tables/QueryCell'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type TokenAmountProps = {
  amount: number | undefined
  amountUsd: number | Nullish
  blockchainId?: string
  /** Token contract address used to render the token icon, or the addresses of a token pair. */
  tokenAddress?: Address | Address[]
  amountLoading?: boolean
  usdLoading?: boolean
  /** Shown as an error icon, next to the USD amount if there is one */
  usdError?: Error | null
  tooltipTitle?: ReactNode
  tooltipBody?: ReactNode
  abbreviate?: boolean
  iconSize?: Size
  horizontal?: boolean
}

export const TokenAmount = ({
  amount,
  amountUsd,
  blockchainId,
  tokenAddress,
  amountLoading = false,
  usdLoading = false,
  usdError = null,
  tooltipTitle,
  tooltipBody,
  abbreviate = true,
  iconSize = 'mui-md',
  horizontal = false,
}: TokenAmountProps) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: horizontal ? '1fr 1fr' : '1fr',
      rowGap: Spacing.xs,
      columnGap: Spacing.md,
      justifyItems: 'end',
      alignItems: 'center',
    }}
  >
    <Box sx={{ gridRow: horizontal ? 'auto' : 2 }}>
      <QueryCell query={q({ data: amountUsd, isLoading: usdLoading, error: usdError })}>
        <Tooltip title={formatNumber(amountUsd, { decimals: 5, unit: 'dollar', abbreviate: false, fallback: '-' })}>
          <Typography variant="tableCellSupport" color="textSecondary">
            {formatNumber(amountUsd, 'usd.notional')}
          </Typography>
        </Tooltip>
      </QueryCell>
    </Box>
    <Box sx={{ gridRow: horizontal ? 'auto' : 1 }}>
      <WithSkeleton loading={amountLoading}>
        <Tooltip title={tooltipTitle ?? ''} body={tooltipBody}>
          <Stack direction="row" spacing={Spacing.xs} sx={{ alignItems: 'center' }}>
            <Typography variant="tableCellValue">{formatNumber(amount, { abbreviate, fallback: '-' })}</Typography>
            {blockchainId && tokenAddress && (
              <TokenIcon blockchainId={blockchainId} address={tokenAddress} size={iconSize} />
            )}
          </Stack>
        </Tooltip>
      </WithSkeleton>
    </Box>
  </Box>
)
