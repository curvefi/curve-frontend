import { DetailInfoTradeRouteRoute } from '@/dex/components/PageRouterSwap/components/DetailInfoTradeRouteRoute'
import type { Route } from '@/dex/components/PageRouterSwap/types'
import type { PoolsMapper } from '@/dex/hooks/usePoolsMapper'
import type { TokenMapper } from '@/dex/queries/tokens.query'
import type { NetworkUrlParams } from '@/dex/types/main.types'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { IndicatorIcon } from '@ui/icons/IndicatorIcon'
import { t } from '@ui/lib/i18n'

export const RoutesActionInfo = ({
  params,
  routes,
  tokens,
  poolsMapper,
  swapCustomRouteRedirect,
}: {
  params: NetworkUrlParams
  routes: QueryProp<Route[]>
  tokens: TokenMapper | undefined
  poolsMapper: PoolsMapper | undefined
  swapCustomRouteRedirect: Record<string, string> | undefined
}) => (
  <>
    <ActionInfo
      size="small"
      label={t`Trade route`}
      value={mapQuery(routes, routes =>
        routes?.length === 1 ? (
          <DetailInfoTradeRouteRoute
            params={params}
            route={routes[0]}
            tokens={tokens}
            pool={poolsMapper?.[routes[0].poolId]}
            swapCustomRouteRedirect={swapCustomRouteRedirect?.[routes[0].poolId]}
          />
        ) : (
          !routes?.length && '-'
        ),
      )}
    />
    {(routes.data?.length ?? 0) > 1 && (
      // the action info isn't able to wrap properly to take the whole line without changing it a lot.
      // here we follow the design and use multiple action infos
      <Stack direction="row" sx={{ width: '100%' }}>
        <Stack direction="row">
          <Box
            sx={{
              marginBlock: '8px 10px', // align to bottom and top
              opacity: '0.7',
              borderLeft: t => `2px solid ${t.design.Color.Neutral[700]}`,
            }}
          ></Box>
          <Stack direction="column">
            {routes.data?.map((_, index) => (
              // eslint-disable-next-line @eslint-react/no-array-index-key -- Existing violation before enabling this rule.
              <Box key={index} sx={{ width: 16, height: 20 }}>
                <IndicatorIcon sx={{ width: 12, height: 12, color: t => t.design.Color.Neutral[700] }} />
              </Box>
            ))}
          </Stack>
        </Stack>
        <Stack direction="column" sx={{ width: '100%' }}>
          {routes.data?.map(route => (
            <DetailInfoTradeRouteRoute
              key={`${route.poolId}-${route.outputCoinAddress}`}
              params={params}
              route={route}
              tokens={tokens}
              pool={poolsMapper?.[route.poolId]}
              swapCustomRouteRedirect={swapCustomRouteRedirect?.[route.poolId]}
            />
          ))}
        </Stack>
      </Stack>
    )}
  </>
)
