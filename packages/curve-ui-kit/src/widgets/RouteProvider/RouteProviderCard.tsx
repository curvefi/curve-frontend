import { type ReactNode, useCallback } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SelectableCard } from '@ui-kit/shared/ui/SelectableCard'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { Decimal } from '@ui-kit/utils/decimal'
import { formatUsd } from '@ui-kit/utils/number'
import { RouteComparisonChip } from '@ui-kit/widgets/RouteProvider/RouteComparisonChip'
import type { RouteOption } from './RouteProvidersAccordion'

const { Spacing } = SizesAndSpaces

export type RouteProviderCardProps = {
  route: RouteOption
  tokenSymbol: string
  usdPrice: number | null
  isSelected: boolean
  bestOutputAmount: Decimal | undefined
  providerLabel: string
  onSelect: (provider: RouteOption) => void
  icon: ReactNode
}

export const RouteProviderCard = ({
  route,
  tokenSymbol,
  usdPrice,
  isSelected,
  bestOutputAmount,
  providerLabel,
  onSelect,
  icon: Icon,
}: RouteProviderCardProps) => (
  <SelectableCard
    onClick={useCallback(() => onSelect(route), [onSelect, route])}
    disabled={route.isLoading}
    isSelected={isSelected}
    data-testid="route-provider-card"
    sx={{ padding: Spacing.sm.desktop }}
  >
    <Stack sx={{ width: '100%' }} data-testid="route-provider-rows">
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <WithSkeleton loading={route.isLoading}>
          <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
            <Typography
              variant="tableCellMBold"
              component="span"
              color="textPrimary"
              data-testid="route-provider-amount"
            >
              {route.toAmountOutput}
            </Typography>
            {tokenSymbol && (
              <Typography variant="bodyXsRegular" component="span" color="textSecondary">
                {tokenSymbol}
              </Typography>
            )}
          </Box>
        </WithSkeleton>
        <RouteComparisonChip
          bestOutputAmount={bestOutputAmount}
          toAmountOutput={route.toAmountOutput}
          isLoading={route.isLoading}
        />
      </Stack>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <WithSkeleton loading={route.isLoading}>
          <Typography variant="bodyXsRegular" color="textTertiary" data-testid="route-provider-usd">
            {usdPrice == null ? '-' : `~${formatUsd(parseFloat(route.toAmountOutput) * usdPrice)}`}
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
