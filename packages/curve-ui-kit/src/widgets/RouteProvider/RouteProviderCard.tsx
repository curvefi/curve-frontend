import { type ReactNode, useCallback } from 'react'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { Sizing } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { type Decimal, formatUsd } from '@ui-kit/utils'
import { RouteComparisonChip } from '@ui-kit/widgets/RouteProvider/RouteComparisonChip'
import type { RouteOption } from './RouteProvidersAccordion'

const { Spacing, OutlineWidth } = SizesAndSpaces

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
  <ButtonBase
    onClick={useCallback(() => onSelect(route), [onSelect, route])}
    disabled={route.isLoading}
    sx={(t) => ({
      // todo: check if we need a better component for this
      width: '100%',
      display: 'flex',
      textAlign: 'left',
      alignItems: 'stretch',
      padding: Spacing.sm,
      backgroundColor: t.design.Layer[1].Fill,
      border: `${isSelected ? OutlineWidth : Sizing[10]} solid ${
        isSelected ? t.design.Layer.Highlight.Outline : t.design.Layer[1].Outline
      }`,
    })}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="center" gap={Spacing.sm} sx={{ width: '100%' }}>
      <Stack gap={Spacing.xxs}>
        <WithSkeleton loading={route.isLoading}>
          <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
            <Typography variant="tableCellMBold" component="span" color="textPrimary">
              {route.toAmountOutput}
            </Typography>
            {tokenSymbol && (
              <Typography variant="bodyXsRegular" component="span" color="textSecondary">
                {tokenSymbol}
              </Typography>
            )}
          </Box>
        </WithSkeleton>
        <WithSkeleton loading={route.isLoading}>
          <Typography variant="bodyXsRegular" color="textTertiary">
            {usdPrice == null ? '-' : `~${formatUsd(parseFloat(route.toAmountOutput) * usdPrice)}`}
          </Typography>
        </WithSkeleton>
      </Stack>
      <Stack alignItems="flex-end" gap={Spacing.xxs}>
        <RouteComparisonChip
          bestOutputAmount={bestOutputAmount}
          toAmountOutput={route.toAmountOutput}
          isLoading={route.isLoading}
        />
        <Stack direction="row" alignItems="center" gap={Spacing.xxs}>
          {Icon}
          <Typography variant="bodyXsRegular" color="textSecondary">
            {providerLabel}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  </ButtonBase>
)
