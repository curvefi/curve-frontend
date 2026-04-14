import { zip } from 'lodash'
import { zeroAddress } from 'viem'
import type { Route } from '@/dex/components/PageRouterSwap/types'
import { ROUTE } from '@/dex/constants'
import { type PoolData, type UrlParams } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import Stack from '@mui/material/Stack'
import { ExternalLink } from '@ui/Link'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { RouterLink } from '@ui-kit/shared/ui/RouterLink'
import { TokenIcons } from '@ui-kit/shared/ui/TokenIcons'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { shortenAddress } from '@ui-kit/utils'

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
  tokensNameMapper: { [address: string]: string }
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
          <Stack direction="row" alignItems="center" gap={Spacing.sm}>
            {tokens && (
              <TokenIcons
                blockchainId={params.network}
                tokens={zip(tokens, tokenAddresses).map(([symbol = '?', address = zeroAddress]) => ({
                  symbol,
                  address,
                }))}
                variant="icon"
              />
            )}
            <RouterLink href={getPath(params, `${ROUTE.PAGE_POOLS}/${route.routeUrlId}/deposit`)} target="_blank">
              {route.name || route.poolId}
            </RouterLink>
          </Stack>
        ) : (
          route?.name
        )
      }
      prevValue={inputToken}
      value={outputToken}
    />
  )
}
