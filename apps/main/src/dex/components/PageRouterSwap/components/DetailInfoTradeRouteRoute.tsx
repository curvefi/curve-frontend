import { zip } from 'lodash'
import { useMemo } from 'react'
import { isAddress, zeroAddress, type Address } from 'viem'
import type { Route } from '@/dex/components/PageRouterSwap/types'
import { ROUTE } from '@/dex/constants'
import { getTokens, tryGetPool } from '@/dex/pool.utils'
import { getToken, type TokenMapper } from '@/dex/queries/tokens.query'
import type { UrlParams } from '@/dex/types/main.types'
import { useCurve } from '@evm-ui/features/connect-wallet'
import { shortenAddress } from '@evm-ui/utils'
import { ExternalLink } from '@legacy-ui/Link'
import Stack from '@mui/material/Stack'
import { maybe } from '@primitives/objects.utils'
import { RouterLink } from '@ui/components/RouterLink'
import { TokenIcons } from '@ui/components/TokenIcons'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

const formatRoute = (route: Route) =>
  route.name || (isAddress(route.poolId, { strict: false }) ? shortenAddress(route.poolId) : route.poolId)

export const DetailInfoTradeRouteRoute = ({
  params,
  route,
  tokens,
  poolId,
  swapCustomRouteRedirect,
}: {
  params: UrlParams
  route: Route
  tokens: TokenMapper | undefined
  poolId: string // The router may or may not return the pool id as string, it's a bit uncertain at this point during migration.
  swapCustomRouteRedirect: string | undefined
}) => {
  const inputToken = getToken(tokens, route.inputCoinAddress)?.symbol ?? shortenAddress(route.inputCoinAddress)
  const outputToken = getToken(tokens, route.outputCoinAddress)?.symbol ?? shortenAddress(route.outputCoinAddress)

  const { curveApi, isHydrated } = useCurve()
  const pool = useMemo(
    () => (isHydrated ? tryGetPool(poolId as Address, curveApi) : undefined),
    [poolId, curveApi, isHydrated],
  )
  const { tokens: poolTokens, tokenAddresses } = useMemo(
    () => maybe(pool, pool => getTokens(pool, { wrapped: false })) ?? { tokens: undefined, tokenAddresses: undefined },
    [pool],
  )
  return (
    <ActionInfo
      size="small"
      label={
        swapCustomRouteRedirect ? (
          <ExternalLink $noStyles href={swapCustomRouteRedirect} target="_blank">
            {formatRoute(route)}
          </ExternalLink>
        ) : route.routeUrlId ? (
          <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.sm }}>
            {poolTokens && (
              <TokenIcons
                blockchainId={params.network}
                tokens={zip(poolTokens, tokenAddresses).map(([symbol = '?', address = zeroAddress]) => ({
                  symbol,
                  address,
                }))}
                size="md"
              />
            )}
            <RouterLink
              href={ROUTE.PAGE_POOL({ blockchainId: params.network, poolAddress: route.routeUrlId as Address })}
              target="_blank"
              sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              {formatRoute(route)}
            </RouterLink>
          </Stack>
        ) : (
          route?.name
        )
      }
      value={inputToken}
      futureValue={outputToken}
    />
  )
}
