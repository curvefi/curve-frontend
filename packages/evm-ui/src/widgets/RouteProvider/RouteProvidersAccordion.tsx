import { useMemo } from 'react'
import type { RouteQueries, RouteResponse } from '@evm-ui/entities/router-api'
import { ErrorIconButton } from '@evm-ui/shared/ui/ErrorIconButton'
import { decimalMax } from '@evm-ui/utils'
import { RouteComparisonChip } from '@evm-ui/widgets/RouteProvider/RouteComparisonChip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { notFalsy } from '@primitives/objects.utils'
import type { RouteProvider } from '@primitives/router.utils'
import { Accordion } from '@ui/components/Accordion'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import { LoadingAnimation } from '@ui/features/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { ReloadIcon } from '@ui/icons/ReloadIcon'
import { t } from '@ui/lib/i18n'
import { RouteProviderCard, type RouteProviderCardProps } from './RouteProviderCard'
import { RouteProviderIcons, RouteProviderLabels } from './RouteProviders'

const { Spacing } = SizesAndSpaces

export type RouteProviderProps = {
  queries: RouteQueries
  enabled: boolean
  selectedRoute: RouteResponse | undefined
  selectedRouter: RouteProvider | undefined
  onChange: (router: RouteProvider) => void
  tokenOut: RouteProviderCardProps['tokenOut']
  isExpanded: boolean
  onToggle: () => void
  onRefresh: () => void
  chainId: number
  providers: readonly RouteProvider[]
}

export const RouteProvidersAccordion = ({
  queries,
  enabled,
  selectedRoute,
  selectedRouter,
  onChange,
  tokenOut,
  isExpanded,
  onToggle,
  onRefresh,
  chainId,
  providers,
}: RouteProviderProps) => {
  const queryList = useMemo(() => providers.map(provider => queries[provider]), [providers, queries])
  const maxAmountOut = useMemo(
    () => queries && decimalMax(...notFalsy(...queryList.flatMap(route => route.data?.amountOut))),
    [queryList, queries],
  )
  const Icon = selectedRoute ? RouteProviderIcons[selectedRoute.router] : null
  const allError = queryList.every(r => r.error)
  const allLoading = queryList.every(r => r.isLoading)
  const anyFetching = queryList.some(r => r.isFetching)
  return (
    enabled && (
      <Accordion
        ghost
        title={t`Route provider`}
        size="extraSmall"
        testId="route-provider-accordion"
        info={
          allError ? (
            <ErrorIconButton error={t`Cannot fetch any routes. Please try again later.`} size="extraExtraSmall" />
          ) : (
            !isExpanded &&
            (selectedRouter || allLoading ? (
              <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xs }}>
                {Icon && <Icon />}
                <WithSkeleton loading={allLoading}>
                  <Typography variant="bodyXsRegular" color="textPrimary">
                    {selectedRouter ? RouteProviderLabels[selectedRouter] : t`Loading routes`}
                  </Typography>
                </WithSkeleton>
                {selectedRoute && (
                  <RouteComparisonChip maxAmountOut={maxAmountOut} amountOut={selectedRoute.amountOut} />
                )}
              </Stack>
            ) : (
              '-'
            ))
          )
        }
        expanded={isExpanded}
        toggle={onToggle}
      >
        <Stack sx={{ gap: Spacing.sm }}>
          <Stack>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="headingXsBold" color="textSecondary">
                {t`Select a route`}
              </Typography>
              <IconButton
                size="extraExtraSmall"
                onClick={() => void onRefresh()}
                aria-label={t`Refresh routes`}
                disabled={anyFetching}
                data-testid="refresh-button"
              >
                <ReloadIcon sx={{ ...(anyFetching && LoadingAnimation) }} />
              </IconButton>
            </Stack>
            <Typography variant="bodyXsRegular" color="textTertiary">
              {t`Best route is selected based on net output after gas fees (only when possible to calculate).`}
            </Typography>
          </Stack>
          <Stack sx={{ gap: Spacing.xs }}>
            {/* we don't need to handle providers.length === 0, this component shouldn't be displayed in that case */}
            {providers.map(provider => (
              <RouteProviderCard
                key={provider}
                tokenOut={tokenOut}
                isSelected={provider === selectedRouter}
                router={provider}
                query={queries[provider]}
                bestOutputAmount={maxAmountOut}
                onSelect={onChange}
                chainId={chainId}
              />
            ))}
          </Stack>
        </Stack>
      </Accordion>
    )
  )
}
