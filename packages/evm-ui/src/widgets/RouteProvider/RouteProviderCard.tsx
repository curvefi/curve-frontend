import { useCallback } from 'react'
import type { RouteQuery } from '@evm-ui/entities/router-api'
import { t } from '@evm-ui/lib/i18n'
import { useEstimateGas } from '@evm-ui/lib/model/entities/gas-info'
import { FireIcon } from '@evm-ui/shared/icons/FireIcon'
import { ReloadIcon } from '@evm-ui/shared/icons/ReloadIcon'
import { ErrorIconButton } from '@evm-ui/shared/ui/ErrorIconButton'
import { SelectableCard } from '@evm-ui/shared/ui/SelectableCard'
import { Tooltip } from '@evm-ui/shared/ui/Tooltip'
import { WithSkeleton } from '@evm-ui/shared/ui/WithSkeleton'
import { WithWrapper } from '@evm-ui/shared/ui/WithWrapper'
import { LoadingAnimation } from '@evm-ui/themes/design/0_primitives'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import type { QueryProp } from '@evm-ui/types/util'
import { formatNumber, fromWei, PLACEHOLDER, PLACEHOLDER_USD } from '@evm-ui/utils'
import { RouteComparisonChip } from '@evm-ui/widgets/RouteProvider/RouteComparisonChip'
import { RouteProviderIcons, RouteProviderLabels } from '@evm-ui/widgets/RouteProvider/RouteProviders'
import type { BaseConfig } from '@legacy-ui/utils'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import type { RouteProvider } from '@primitives/router.utils'

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
                  {isLoading ? PLACEHOLDER : formatNumber(out, 'token.amount')}
                </Typography>
              </WithSkeleton>
              {toTokenSymbol && (
                <Typography variant="bodyXsRegular" component="span" color="textSecondary">
                  {toTokenSymbol}
                </Typography>
              )}
            </Box>
            <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xxs }}>
              <Icon />
              <Typography variant="bodyXsRegular" color="textSecondary">
                {RouteProviderLabels[router]}
              </Typography>
            </Stack>
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
              {isFetching && <ReloadIcon sx={{ ...LoadingAnimation, width: IconSize.xxs, height: IconSize.xxs }} />}
            </Stack>
            <Stack direction="row" sx={{ gap: Spacing.sm, alignItems: 'center' }}>
              {gasEstimate?.estGasCostUsd != null && !isFetching && (
                <Stack direction="row">
                  <FireIcon sx={{ width: IconSize.xs, height: IconSize.xs, color: 'textTertiary' }} />
                  <Typography variant="bodyXsRegular" color="textTertiary">
                    {formatNumber(gasEstimate.estGasCostUsd, 'usd.notional')}
                  </Typography>
                </Stack>
              )}
              {error ? (
                <ErrorIconButton error={error} size="extraSmall" />
              ) : (
                route && <RouteComparisonChip maxAmountOut={bestOutputAmount} amountOut={route.amountOut} />
              )}
            </Stack>
          </Stack>
        </Stack>
      </SelectableCard>
    </WithWrapper>
  )
}
