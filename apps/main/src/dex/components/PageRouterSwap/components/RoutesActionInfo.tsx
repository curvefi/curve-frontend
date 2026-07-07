import { DetailInfoTradeRouteRoute } from '@/dex/components/PageRouterSwap/components/DetailInfoTradeRouteRoute'
import type { Route } from '@/dex/components/PageRouterSwap/types'
import { type NetworkUrlParams, type PoolDataMapper, TokensNameMapper } from '@/dex/types/main.types'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { IndicatorIcon } from '@ui-kit/shared/icons/IndicatorIcon'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { mapQuery, type QueryProp } from '@ui-kit/types/util'

export const RoutesActionInfo = ({
  params,
  routes,
  tokensNameMapper,
  poolDataMapper,
  swapCustomRouteRedirect,
}: {
  params: NetworkUrlParams
  routes: QueryProp<Route[]>
  tokensNameMapper: TokensNameMapper
  poolDataMapper: PoolDataMapper | undefined
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
            tokensNameMapper={tokensNameMapper}
            poolData={poolDataMapper?.[routes[0].poolId]}
            swapCustomRouteRedirect={swapCustomRouteRedirect?.[routes[0].poolId]}
          />
        ) : (
          !routes?.length && '-'
        ),
      )}
    />
    {!!routes.data?.length && (
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
            {routes.data.map((_, index) => (
              // eslint-disable-next-line @eslint-react/no-array-index-key -- Existing violation before enabling this rule.
              <Box key={index} sx={{ width: 16, height: 20 }}>
                <IndicatorIcon sx={{ width: 12, height: 12, color: t => t.design.Color.Neutral[700] }} />
              </Box>
            ))}
          </Stack>
        </Stack>
        <Stack direction="column" sx={{ width: '100%' }}>
          {routes.data.map(route => (
            <DetailInfoTradeRouteRoute
              key={`${route.poolId}-${route.outputCoinAddress}`}
              params={params}
              route={route}
              tokensNameMapper={tokensNameMapper}
              poolData={poolDataMapper?.[route.poolId]}
              swapCustomRouteRedirect={swapCustomRouteRedirect?.[route.poolId]}
            />
          ))}
        </Stack>
      </Stack>
    )}
  </>
)
