import { DetailInfoTradeRouteRoute } from '@/dex/components/PageRouterSwap/components/DetailInfoTradeRouteRoute'
import type { Route } from '@/dex/components/PageRouterSwap/types'
import { type NetworkUrlParams, TokensNameMapper } from '@/dex/types/main.types'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
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
}: {
  params: NetworkUrlParams
  loading: boolean
  routes: Route[] | undefined
  tokensNameMapper: TokensNameMapper
}) => (
  <ActionInfo
    label={t`Trade routed through:`}
    value={
      routes?.length ? (
        <Stack direction="row" gap={Spacing.sm}>
          {routes.length > 1 && <RouteTrack />}
          <List sx={{ paddingTop: 0, ...(routes.length <= 1 && { paddingBottom: 0 }) }}>
            {routes.map((route) => (
              <ListItem
                key={`${route.poolId}-${route.outputCoinAddress}`}
                sx={(t) => ({ whiteSpace: 'nowrap', padding: 0, ...t.typography.bodySRegular })}
              >
                <DetailInfoTradeRouteRoute
                  params={params}
                  route={route}
                  routesLength={routes.length}
                  tokensNameMapper={tokensNameMapper}
                />
              </ListItem>
            ))}
          </List>
        </Stack>
      ) : (
        '-'
      )
    }
    {...(routes && routes.length > 1 && { flexWrap: 'wrap', alignItems: 'start' })}
    loading={loading && [180, 24]}
  />
)
