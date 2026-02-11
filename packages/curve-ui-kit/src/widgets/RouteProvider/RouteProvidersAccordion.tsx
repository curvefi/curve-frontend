import { useMemo } from 'react'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { ReloadIcon } from '@ui-kit/shared/icons/ReloadIcon'
import { Accordion } from '@ui-kit/shared/ui/Accordion'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { LoadingAnimation } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { type Address, decimalMax } from '@ui-kit/utils'
import { RouteComparisonChip } from '@ui-kit/widgets/RouteProvider/RouteComparisonChip'
import type { RouteOption } from './route-provider.types'
import { RouteProviderCard } from './RouteProviderCard'
import { RouteProviderIcons } from './RouteProviderIcons'

const { Spacing } = SizesAndSpaces

const providerLabels = {
  curve: t`Curve`,
  enso: t`Enso`,
  odos: t`Odos`,
}

export type { RouteOption }

export type RouteProviderProps = {
  routes: RouteOption[]
  selectedRoute: RouteOption
  onChange: (route: RouteOption) => void
  outputTokenAddress: Address
  tokenSymbols: Record<Address, string>
  usdPrice: number | null
  isExpanded: boolean
  isLoading: boolean
  onToggle: () => void
  onRefresh: () => void
}

export const RouteProvidersAccordion = ({
  routes,
  selectedRoute,
  onChange,
  outputTokenAddress,
  tokenSymbols,
  usdPrice,
  isExpanded,
  isLoading,
  onToggle,
  onRefresh,
}: RouteProviderProps) => {
  const bestOutputAmount = useMemo(() => decimalMax(...routes.map((route) => route.toAmountOutput)), [routes])
  const Icon = selectedRoute ? RouteProviderIcons[selectedRoute.provider] : null
  return (
    <Accordion
      ghost
      title={t`Route provider`}
      info={
        !isExpanded &&
        selectedRoute && (
          <Stack direction="row" alignItems="center" gap={Spacing.xs}>
            {Icon && <Icon />}
            <WithSkeleton loading={isLoading}>
              <Typography variant="bodySRegular" color="textPrimary">
                {providerLabels[selectedRoute.provider]}
              </Typography>
            </WithSkeleton>
            <RouteComparisonChip bestOutputAmount={bestOutputAmount} toAmountOutput={selectedRoute.toAmountOutput} />
          </Stack>
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
          {routes.map((route) => (
            <RouteProviderCard
              key={route.provider}
              tokenSymbol={tokenSymbols[outputTokenAddress]}
              isSelected={route === selectedRoute}
              providerLabel={providerLabels[route.provider]}
              route={route}
              usdPrice={usdPrice}
              bestOutputAmount={bestOutputAmount}
              onSelect={onChange}
              icon={RouteProviderIcons[route.provider]()}
            />
          ))}
        </Stack>
      </Stack>
    </Accordion>
  )
}
