import type { ReactNode } from 'react'
import { TokenIcon, type Size } from '@evm-ui/shared/ui/TokenIcon'
import { Tooltip } from '@evm-ui/shared/ui/Tooltip'
import { WithSkeleton } from '@evm-ui/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { formatNumber } from '@evm-ui/utils'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

const { Spacing } = SizesAndSpaces

type TokenAmountProps = {
  amount: number | undefined
  amountUsd: number | null | undefined
  blockchainId?: string
  tokenAddress?: string
  amountLoading?: boolean
  usdLoading?: boolean
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
      <WithSkeleton loading={usdLoading}>
        <Tooltip title={formatNumber(amountUsd, { decimals: 5, unit: 'dollar', abbreviate: false, fallback: '-' })}>
          <Typography variant="bodySRegular" sx={{ color: 'text.secondary' }}>
            {formatNumber(amountUsd, 'usd.notional')}
          </Typography>
        </Tooltip>
      </WithSkeleton>
    </Box>
    <Box sx={{ gridRow: horizontal ? 'auto' : 1 }}>
      <WithSkeleton loading={amountLoading}>
        <Tooltip title={tooltipTitle ?? ''} body={tooltipBody}>
          <Stack direction="row" spacing={Spacing.xs} sx={{ alignItems: 'center' }}>
            <Typography variant="tableCellMRegular">{formatNumber(amount, { abbreviate, fallback: '-' })}</Typography>
            {blockchainId && tokenAddress && (
              <TokenIcon blockchainId={blockchainId} address={tokenAddress} size={iconSize} />
            )}
          </Stack>
        </Tooltip>
      </WithSkeleton>
    </Box>
  </Box>
)
