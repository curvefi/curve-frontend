import { useCallback } from 'react'
import type { RouteQuery } from '@evm-ui/entities/router-api'
import { getChainName } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { useEstimateGasValue } from '@evm-ui/lib/model/entities/gas-info'
import { ErrorIconButton } from '@evm-ui/shared/ui/ErrorIconButton'
import { formatNumber, fromWei, PLACEHOLDER, PLACEHOLDER_USD } from '@evm-ui/utils'
import { RouteComparisonChip } from '@evm-ui/widgets/RouteProvider/RouteComparisonChip'
import { RouteProviderIcons, RouteProviderLabels } from '@evm-ui/widgets/RouteProvider/RouteProviders'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import type { RouteProvider } from '@primitives/router.utils'
import { SelectableCard } from '@ui/components/SelectableCard'
import { Tooltip } from '@ui/components/Tooltip'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import { WithWrapper } from '@ui/components/WithWrapper'
import type { QueryProp } from '@ui/features/queries/util'
import { LoadingAnimation } from '@ui/features/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { FireIcon } from '@ui/icons/FireIcon'
import { ReloadIcon } from '@ui/icons/ReloadIcon'
import { t } from '@ui/lib/i18n'

const { Spacing, IconSize } = SizesAndSpaces

export type RouteProviderCardProps = {
  query: RouteQuery
  tokenOut: Partial<{ symbol: string | undefined; address: Address; decimals: number }> & { usdRate: QueryProp<number> }
  isSelected: boolean
  bestOutputAmount: Decimal | undefined
  router: RouteProvider
  onSelect: (provider: RouteProvider) => void
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
}: RouteProviderCardProps) => {
  const out = maybes([route, decimals], ({ amountOut }, decimals) => fromWei(amountOut[0], decimals))
  const { data: gasEstimate } = useEstimateGasValue(chainId, route?.gas)
  const Icon = RouteProviderIcons[router]
  const disabledTooltip = t`${RouteProviderLabels[router]} is unavailable on ${getChainName(chainId)}.`
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
