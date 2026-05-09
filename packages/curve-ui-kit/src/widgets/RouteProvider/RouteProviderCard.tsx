import { type ReactNode, useCallback } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { RouteResponse } from '@ui-kit/entities/router-api'
import { ErrorIconButton } from '@ui-kit/shared/ui/ErrorIconButton'
import { SelectableCard } from '@ui-kit/shared/ui/SelectableCard'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { QueryProp } from '@ui-kit/types/util'
import { formatNumber, fromWei } from '@ui-kit/utils'
import { formatUsd } from '@ui-kit/utils/number'
import { RouteComparisonChip } from '@ui-kit/widgets/RouteProvider/RouteComparisonChip'

const { Spacing } = SizesAndSpaces

export type RouteProviderCardProps = {
  query: QueryProp<RouteResponse | null>
  tokenOut: Partial<{ symbol: string | undefined; address: Address; decimals: number }> & { usdRate: QueryProp<number> }
  isSelected: boolean
  bestOutputAmount: Decimal | undefined
  providerLabel: string
  onSelect: (provider: RouteResponse) => void
  icon: ReactNode
}

export const RouteProviderCard = ({
  query: { data: route, error, isLoading },
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
  const amountOut = decimals == null || !route ? null : fromWei(route.amountOut[0], decimals)
  return (
    <SelectableCard
      onClick={useCallback(() => route && onSelect(route), [onSelect, route])}
      isSelected={isSelected}
      isError={!!error}
      data-testid="route-provider-card"
      sx={{ padding: Spacing.sm.desktop }}
    >
      <Stack sx={{ width: '100%' }} gap={Spacing.xxs} data-testid="route-provider-rows">
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="baseline" gap={Spacing.xxs}>
            <WithSkeleton loading={isLoading}>
              <Typography
                variant="tableCellMBold"
                component="span"
                color="textPrimary"
                data-testid="route-provider-amount"
              >
                {amountOut == null ? '-' : formatNumber(amountOut, { abbreviate: false })}
              </Typography>
            </WithSkeleton>
            {toTokenSymbol && (
              <Typography variant="bodyXsRegular" component="span" color="textSecondary">
                {toTokenSymbol}
              </Typography>
            )}
          </Box>
          {error ? (
            <ErrorIconButton error={error} size="small" />
          ) : (
            route && <RouteComparisonChip maxAmountOut={bestOutputAmount} amountOut={route.amountOut} />
          )}
        </Stack>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <WithSkeleton loading={isLoading}>
            <Typography variant="bodyXsRegular" color="textTertiary" data-testid="route-provider-usd">
              {amountOut == null || usdRate == null ? '-' : `~${formatUsd(parseFloat(amountOut) * usdRate)}`}
            </Typography>
          </WithSkeleton>
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
