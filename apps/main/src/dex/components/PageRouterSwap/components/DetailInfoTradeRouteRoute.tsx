import { zip } from 'lodash'
import { zeroAddress } from 'viem'
import type { Route } from '@/dex/components/PageRouterSwap/types'
import { ROUTE } from '@/dex/constants'
import { type PoolData, type UrlParams } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import { ActionInfo } from '@evm-ui/shared/ui/ActionInfo'
import { RouterLink } from '@evm-ui/shared/ui/RouterLink'
import { TokenIcons } from '@evm-ui/shared/ui/TokenIcons'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { shortenAddress } from '@evm-ui/utils'
import { ExternalLink } from '@legacy-ui/Link'
import Stack from '@mui/material/Stack'

const { Spacing } = SizesAndSpaces

export const DetailInfoTradeRouteRoute = ({
  params,
  route,
  tokensNameMapper,
  poolData,
  swapCustomRouteRedirect,
}: {
  params: UrlParams
  route: Route
  tokensNameMapper: Record<string, string>
  poolData: PoolData | undefined
  swapCustomRouteRedirect: string | undefined
}) => {
  const inputToken = tokensNameMapper[route.inputCoinAddress] ?? shortenAddress(route.inputCoinAddress) ?? ''
  const outputToken = tokensNameMapper[route.outputCoinAddress] ?? shortenAddress(route.outputCoinAddress) ?? ''
  const { tokenAddresses, tokens } = poolData ?? {}
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
            {tokens && (
              <TokenIcons
                blockchainId={params.network}
                tokens={zip(tokens, tokenAddresses).map(([symbol = '?', address = zeroAddress]) => ({
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
