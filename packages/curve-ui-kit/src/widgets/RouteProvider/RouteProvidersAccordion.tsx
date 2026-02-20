import { useMemo } from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { ReloadIcon } from '@ui-kit/shared/icons/ReloadIcon'
import { Accordion } from '@ui-kit/shared/ui/Accordion'
import { ErrorIconButton } from '@ui-kit/shared/ui/ErrorIconButton'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { LoadingAnimation } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { decimalMax } from '@ui-kit/utils'
import { RouteComparisonChip } from '@ui-kit/widgets/RouteProvider/RouteComparisonChip'
import type { RouteOption } from './route-provider.types'
import { RouteProviderCard } from './RouteProviderCard'
import { RouteProviderIcons } from './RouteProviderIcons'

const { Spacing, ButtonSize } = SizesAndSpaces

const providerLabels = {
  curve: t`Curve`,
  enso: t`Enso`,
  odos: t`Odos`,
}

export type { RouteOption }

export type RouteProviderProps = {
  routes: RouteOption[] | undefined
  selectedRoute: RouteOption | undefined
  onChange: (route: RouteOption) => void
  toTokenSymbol: string | undefined
  isExpanded: boolean
  isLoading: boolean
  error: Error | null | undefined
  onToggle: () => void
  onRefresh: () => void
}

export const RouteProvidersAccordion = ({
  routes,
  selectedRoute,
  onChange,
  toTokenSymbol,
  isLoading,
  error,
  isExpanded,
  onToggle,
  onRefresh,
}: RouteProviderProps) => {
  const bestOutputAmount = useMemo(() => routes && decimalMax(...routes.map((route) => route.toAmountOutput)), [routes])
  const Icon = selectedRoute ? RouteProviderIcons[selectedRoute.provider] : null
  return (
    <Accordion
      ghost
      title={t`Route provider`}
      info={
        error ? (
          <ErrorIconButton error={error} />
        ) : (
          !isExpanded &&
          (selectedRoute ? (
            <Stack direction="row" alignItems="center" gap={Spacing.xs}>
              {Icon && <Icon />}
              <WithSkeleton loading={isLoading}>
                <Typography variant="bodySRegular" color="textPrimary">
                  {providerLabels[selectedRoute.provider]}
                </Typography>
              </WithSkeleton>
              <RouteComparisonChip bestOutputAmount={bestOutputAmount} toAmountOutput={selectedRoute.toAmountOutput} />
            </Stack>
          ) : (
            '-'
          ))
        )
      }
      expanded={isExpanded}
      toggle={onToggle}
      sx={{ '&': { paddingBlock: 0 } }} // remove the default padding from the curve accordion
    >
      <Stack paddingBlock={Spacing.sm} gap={Spacing.sm}>
        <Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="headingXsBold" color="textSecondary">
              {t`Select a route`}
            </Typography>
            <IconButton size="extraExtraSmall" onClick={onRefresh} aria-label={t`Refresh routes`}>
              <ReloadIcon sx={{ ...(isLoading && LoadingAnimation) }} />
            </IconButton>
          </Stack>
          <Typography variant="bodyXsRegular" color="textTertiary">
            {t`Best route is selected based on net output after gas fees (only when possible to calculate).`}
          </Typography>
        </Stack>
        <Stack gap={Spacing.xs}>
          {routes?.map((route) => (
            <RouteProviderCard
              key={route.id}
              toTokenSymbol={toTokenSymbol}
              isSelected={route.id === selectedRoute?.id}
              providerLabel={providerLabels[route.provider]}
              route={route}
              bestOutputAmount={bestOutputAmount}
              onSelect={onChange}
              icon={RouteProviderIcons[route.provider]()}
            />
          ))}
          {isLoading && <Skeleton width="100%" height={ButtonSize.lg} />}
          {error?.message && (
            <Alert severity="error">
              <AlertTitle>{error.message}</AlertTitle>
            </Alert>
          )}
        </Stack>
      </Stack>
    </Accordion>
  )
}
