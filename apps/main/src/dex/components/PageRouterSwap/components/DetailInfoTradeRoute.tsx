import { DetailInfoTradeRouteRoute } from '@/dex/components/PageRouterSwap/components/DetailInfoTradeRouteRoute'
import type { Route } from '@/dex/components/PageRouterSwap/types'
import { type NetworkUrlParams, type PoolDataMapper, TokensNameMapper } from '@/dex/types/main.types'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { RouteTrack } from '@ui-kit/widgets/RouteTrack'

const { Spacing } = SizesAndSpaces

export const DetailInfoTradeRoute = ({
  params,
  loading,
  routes,
  tokensNameMapper,
  poolDataMapper,
}: {
  params: NetworkUrlParams
  loading: boolean
  routes: Route[] | undefined
  tokensNameMapper: TokensNameMapper
  poolDataMapper: PoolDataMapper | undefined
}) => (
  <ActionInfo
    size="small"
    label={t`Trade routed through:`}
    value={
      routes?.length ? (
        <Stack direction="row" gap={Spacing.sm} width="100%">
          {routes.length > 1 && <RouteTrack />}
          <Stack direction="column" gap={Spacing.sm} width="100%">
            {routes.map((route) => (
              <DetailInfoTradeRouteRoute
                key={`${route.poolId}-${route.outputCoinAddress}`}
                params={params}
                route={route}
                tokensNameMapper={tokensNameMapper}
                poolData={poolDataMapper?.[route.poolId]}
              />
            ))}
          </Stack>
        </Stack>
      ) : (
        '-'
      )
    }
    loading={loading}
    {...(routes && routes?.length > 1 && { direction: 'column', alignItems: 'start' })}
  />
)
