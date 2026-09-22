import { zip } from 'lodash'
import { useMemo } from 'react'
import { zeroAddress } from 'viem'
import type { Route } from '@/dex/components/PageRouterSwap/types'
import { ROUTE } from '@/dex/constants'
import { getTokens, isWrappedOnly } from '@/dex/pool.utils'
import { getToken, type TokenMapper } from '@/dex/queries/tokens.query'
import type { UrlParams } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { shortenAddress } from '@evm-ui/utils'
import { ExternalLink } from '@legacy-ui/Link'
import Stack from '@mui/material/Stack'
import { maybe } from '@primitives/objects.utils'
import { RouterLink } from '@ui/components/RouterLink'
import { TokenIcons } from '@ui/components/TokenIcons'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const DetailInfoTradeRouteRoute = ({
  params,
  route,
  tokens,
  pool,
  swapCustomRouteRedirect,
}: {
  params: UrlParams
  route: Route
  tokens: TokenMapper | undefined
  pool: PoolTemplate | undefined
  swapCustomRouteRedirect: string | undefined
}) => {
  const inputToken = getToken(tokens, route.inputCoinAddress)?.symbol ?? shortenAddress(route.inputCoinAddress)
  const outputToken = getToken(tokens, route.outputCoinAddress)?.symbol ?? shortenAddress(route.outputCoinAddress)
  const { tokens: poolTokens, tokenAddresses } = useMemo(
    () =>
      maybe(pool, pool => getTokens(pool, { wrapped: isWrappedOnly(pool) })) ?? {
        tokens: undefined,
        tokenAddresses: undefined,
      },
    [pool],
  )
  return (
    <ActionInfo
      size="small"
      label={
        swapCustomRouteRedirect ? (
          <ExternalLink $noStyles href={swapCustomRouteRedirect} target="_blank">
            {route.name || route.poolId}
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
              href={getPath(params, `${ROUTE.PAGE_POOLS}/${route.routeUrlId}`)}
              target="_blank"
              sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              {route.name || route.poolId}
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
