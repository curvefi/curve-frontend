import { type ReactNode, useCallback } from 'react'
import type { Address } from 'viem'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SelectableCard } from '@ui-kit/shared/ui/SelectableCard'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { QueryProp } from '@ui-kit/types/util'
import { type Decimal, formatNumber, fromWei } from '@ui-kit/utils'
import { formatUsd } from '@ui-kit/utils/number'
import { RouteComparisonChip } from '@ui-kit/widgets/RouteProvider/RouteComparisonChip'
import type { RouteOption } from './route-provider.types'

const { Spacing } = SizesAndSpaces

export type RouteProviderCardProps = {
  route: RouteOption
  tokenOut: Partial<{ symbol: string | undefined; address: Address; decimals: number }> & { usdRate: QueryProp<number> }
  isSelected: boolean
  bestOutputAmount: Decimal | undefined
  providerLabel: string
  onSelect: (provider: RouteOption) => void
  icon: ReactNode
}

export const RouteProviderCard = ({
  route,
  tokenOut,
  isSelected,
  bestOutputAmount,
  providerLabel,
  onSelect,
  icon: Icon,
}: RouteProviderCardProps) => {
  const {
    symbol: toTokenSymbol,
    usdRate: { data: usdRate },
    decimals,
  } = tokenOut
  const amountOut = decimals == null ? null : fromWei(route.amountOut[0], decimals)
  return (
    <SelectableCard
      onClick={useCallback(() => onSelect(route), [onSelect, route])}
      isSelected={isSelected}
      data-testid="route-provider-card"
      sx={{ padding: Spacing.sm.desktop }}
    >
      <Stack sx={{ width: '100%' }} gap={Spacing.xxs} data-testid="route-provider-rows">
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box sx={{ display: 'flex', alignItems: 'baseline' }} gap={Spacing.xxs}>
            <Typography
              variant="tableCellMBold"
              component="span"
              color="textPrimary"
              data-testid="route-provider-amount"
            >
              {amountOut == null ? '-' : formatNumber(amountOut, { abbreviate: false })}
            </Typography>
            {toTokenSymbol && (
              <Typography variant="bodyXsRegular" component="span" color="textSecondary">
                {toTokenSymbol}
              </Typography>
            )}
          </Box>
          <RouteComparisonChip maxAmountOut={bestOutputAmount} amountOut={route.amountOut} />
        </Stack>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="bodyXsRegular" color="textTertiary" data-testid="route-provider-usd">
            {amountOut == null || usdRate == null ? '-' : `~${formatUsd(parseFloat(amountOut) * usdRate)}`}
          </Typography>
          <Stack direction="row" alignItems="center" gap={Spacing.xxs}>
            {Icon}
            <Typography variant="bodyXsRegular" color="textSecondary">
              {providerLabel}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </SelectableCard>
  )
}
