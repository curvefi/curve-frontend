import { useCallback } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe, maybes } from '@primitives/objects.utils'
import type { RouteProvider } from '@primitives/router.utils'
import type { BaseConfig } from '@ui/utils'
import type { RouteQuery } from '@ui-kit/entities/router-api'
import { use0xRouter } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { useEstimateGas } from '@ui-kit/lib/model/entities/gas-info'
import { ReloadIcon } from '@ui-kit/shared/icons/ReloadIcon'
import { ErrorIconButton } from '@ui-kit/shared/ui/ErrorIconButton'
import { SelectableCard } from '@ui-kit/shared/ui/SelectableCard'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { LoadingAnimation } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { QueryProp } from '@ui-kit/types/util'
import { formatNumber, fromWei, PLACEHOLDER, PLACEHOLDER_USD } from '@ui-kit/utils'
import { RouteComparisonChip } from '@ui-kit/widgets/RouteProvider/RouteComparisonChip'
import { RouteProviderIcons, RouteProviderLabels } from '@ui-kit/widgets/RouteProvider/RouteProviders'

const { Spacing, IconSize } = SizesAndSpaces

export type RouteProviderCardProps = {
  query: RouteQuery
  tokenOut: Partial<{ symbol: string | undefined; address: Address; decimals: number }> & { usdRate: QueryProp<number> }
  isSelected: boolean
  bestOutputAmount: Decimal | undefined
  router: RouteProvider
  onSelect: (provider: RouteProvider) => void
  networks: Record<number, BaseConfig>
  chainId: number
}

export const RouteProviderCard = ({
  query: { data: route, error, isLoading, isFetching, enabled },
  tokenOut: { symbol: toTokenSymbol, usdRate, decimals },
  isSelected,
  bestOutputAmount,
  onSelect,
  router,
  chainId,
  networks,
}: RouteProviderCardProps) => {
  const out = maybes([route, decimals], ({ amountOut }, decimals) => fromWei(amountOut[0], decimals))
  const { data: gasEstimate } = useEstimateGas(networks, chainId, route?.gas)
  const Icon = RouteProviderIcons[router]
  const disabledTooltip = t`${RouteProviderLabels[router]} is unavailable on ${networks[chainId].name}.`
  const onClick = useCallback(() => (enabled ? onSelect(router) : undefined), [onSelect, router, enabled])
  return (
    (use0xRouter() || router !== '0x') && (
      <WithWrapper shouldWrap={!enabled} Wrapper={Tooltip} title={disabledTooltip}>
        <SelectableCard
          onClick={onClick}
          isSelected={isSelected}
          isError={!!error}
          data-testid="route-provider-card"
          sx={{ padding: Spacing.sm.desktop }}
        >
          <Stack
            data-testid="route-provider-rows"
            sx={{
              gap: Spacing.xxs,
              width: '100%',
              ...(!enabled && { opacity: 0.5, pointerEvents: 'none', cursor: 'not-allowed' }),
            }}
          >
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: Spacing.xxs }}>
                <WithSkeleton loading={isLoading}>
                  <Typography
                    variant="tableCellMBold"
                    component="p"
                    color="textPrimary"
                    data-testid="route-provider-amount"
                  >
                    {isLoading ? PLACEHOLDER : (maybe(out, n => formatNumber(n, { abbreviate: false })) ?? '-')}
                  </Typography>
                </WithSkeleton>
                {toTokenSymbol && (
                  <Typography variant="bodyXsRegular" component="span" color="textSecondary">
                    {toTokenSymbol}
                  </Typography>
                )}
              </Box>
              {error ? (
                <ErrorIconButton error={error} size="extraSmall" />
              ) : (
                route && <RouteComparisonChip maxAmountOut={bestOutputAmount} amountOut={route.amountOut} />
              )}
            </Stack>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Stack direction="row" sx={{ gap: Spacing.xxs, alignItems: 'center' }}>
                <WithSkeleton loading={isLoading}>
                  <Typography variant="bodyXsRegular" color="textTertiary" data-testid="route-provider-usd">
                    {isLoading || usdRate.isLoading
                      ? PLACEHOLDER_USD
                      : (maybes(
                          [out, usdRate.data],
                          (out, usd) => `~${formatNumber(parseFloat(out) * usd, 'usd.notional')}`,
                        ) ?? t`No route available`)}
                  </Typography>
                </WithSkeleton>
                {gasEstimate?.estGasCostUsd != null && !isFetching && (
                  <Typography variant="bodyXsRegular" color="textTertiary">
                    {' - '}
                    {formatNumber(gasEstimate.estGasCostUsd, 'usd.notional')}
                  </Typography>
                )}
                {isFetching && <ReloadIcon sx={{ ...LoadingAnimation, width: IconSize.xxs, height: IconSize.xxs }} />}
              </Stack>
              <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xxs }}>
                <Icon />
                <Typography variant="bodyXsRegular" color="textSecondary">
                  {RouteProviderLabels[router]}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </SelectableCard>
      </WithWrapper>
    )
  )
}
