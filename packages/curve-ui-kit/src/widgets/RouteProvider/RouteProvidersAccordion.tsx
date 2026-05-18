import { useMemo } from 'react'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { notFalsy, recordEntries, recordValues } from '@primitives/objects.utils'
import type { BaseConfig } from '@ui/utils'
import type { RouteQueries, RouteResponse } from '@ui-kit/entities/router-api'
import { t } from '@ui-kit/lib/i18n'
import { ReloadIcon } from '@ui-kit/shared/icons/ReloadIcon'
import { Accordion } from '@ui-kit/shared/ui/Accordion'
import { ErrorIconButton } from '@ui-kit/shared/ui/ErrorIconButton'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { LoadingAnimation } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { decimalMax } from '@ui-kit/utils'
import { RouteComparisonChip } from '@ui-kit/widgets/RouteProvider/RouteComparisonChip'
import { RouteProviderCard, type RouteProviderCardProps } from './RouteProviderCard'
import { RouteProviderIcons } from './RouteProviderIcons'

const { Spacing } = SizesAndSpaces

const providerLabels = {
  curve: t`Curve`,
  enso: t`Enso`,
  odos: t`Odos`,
}

export type RouteProviderProps = {
  queries: RouteQueries
  enabled: boolean
  selectedRoute: RouteResponse | undefined
  onChange: (route: RouteResponse) => void
  tokenOut: RouteProviderCardProps['tokenOut']
  isExpanded: boolean
  onToggle: () => void
  onRefresh: () => void
  networks: Record<number, BaseConfig>
  chainId: number
}

export const RouteProvidersAccordion = ({
  queries,
  enabled,
  selectedRoute,
  onChange,
  tokenOut,
  isExpanded,
  onToggle,
  onRefresh,
  networks,
  chainId,
}: RouteProviderProps) => {
  const queryList = useMemo(() => recordValues(queries).filter(Boolean), [queries])
  const maxAmountOut = useMemo(
    () => queries && decimalMax(...notFalsy(...queryList.flatMap(route => route.data?.amountOut))),
    [queryList, queries],
  )
  const Icon = selectedRoute ? RouteProviderIcons[selectedRoute.router] : null
  const allError = queryList.every(r => r.error)
  const allLoading = queryList.every(r => r.isLoading)
  const anyFetching = queryList.some(r => r.isFetching)
  const anyData = queryList.some(route => route.data)
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
            (selectedRoute || allLoading ? (
              <Stack direction="row" alignItems="center" gap={Spacing.xs}>
                {Icon && <Icon />}
                <WithSkeleton loading={allLoading}>
                  <Typography variant="bodyXsRegular" color="textPrimary">
                    {selectedRoute ? providerLabels[selectedRoute.router] : t`Loading routes`}
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
        <Stack paddingBlock={Spacing.sm} gap={Spacing.sm}>
          <Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="headingXsBold" color="textSecondary">
                {anyData
                  ? t`Select a route`
                  : allLoading
                    ? t`Finding the best route...`
                    : queries === undefined
                      ? t`Please fill in the form to get routes.`
                      : t`No routes available`}
              </Typography>
              <IconButton
                size="extraExtraSmall"
                onClick={onRefresh}
                aria-label={t`Refresh routes`}
                disabled={anyFetching}
              >
                <ReloadIcon sx={{ ...(anyFetching && LoadingAnimation) }} />
              </IconButton>
            </Stack>
            <Typography variant="bodyXsRegular" color="textTertiary">
              {queryList.length === 0 && !anyFetching
                ? t`We could not find any routes with your parameters.`
                : selectedRoute || allLoading
                  ? t`Best route is selected based on net output after gas fees (only when possible to calculate).`
                  : t`Please fill in the form to get routes.`}
            </Typography>
          </Stack>
          <Stack gap={Spacing.xs}>
            {recordEntries(queries).map(([key, query]) => (
              <RouteProviderCard
                key={key}
                tokenOut={tokenOut}
                isSelected={key === selectedRoute?.router}
                providerLabel={providerLabels[key]}
                query={query}
                bestOutputAmount={maxAmountOut}
                onSelect={onChange}
                icon={RouteProviderIcons[key]()}
                networks={networks}
                chainId={chainId}
              />
            ))}
          </Stack>
        </Stack>
      </Accordion>
    )
  )
}
