import type { Route } from '@/dex/components/PageRouterSwap/types'
import { ROUTE } from '@/dex/constants'
import { useNetworks } from '@/dex/entities/networks'
import { type PoolData, type UrlParams } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import Stack from '@mui/material/Stack'
import { ExternalLink } from '@ui/Link'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { RouterLink } from '@ui-kit/shared/ui/RouterLink'
import { TokenPair } from '@ui-kit/shared/ui/TokenPair'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { shortenAddress } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

export const DetailInfoTradeRouteRoute = ({
  params,
  route,
  tokensNameMapper,
  poolData,
}: {
  params: UrlParams
  route: Route
  tokensNameMapper: { [address: string]: string }
  poolData: PoolData | undefined
}) => {
  const inputToken = tokensNameMapper[route.inputCoinAddress] ?? shortenAddress(route.inputCoinAddress) ?? ''
  const outputToken = tokensNameMapper[route.outputCoinAddress] ?? shortenAddress(route.outputCoinAddress) ?? ''
  const { data: networks } = useNetworks()
  const { swapCustomRouteRedirect } =
    Object.values(networks).find(({ networkId }) => networkId === params.network) || {}

  const { tokenAddresses, tokens } = poolData ?? {}
  return (
    <ActionInfo
      size="small"
      label={
        route.poolId && swapCustomRouteRedirect?.[route.poolId] ? (
          <ExternalLink $noStyles href={swapCustomRouteRedirect[route.poolId]} target="_blank">
            {route.name || route.poolId}
          </ExternalLink>
        ) : route.routeUrlId ? (
          <Stack direction="row" alignItems="center" gap={Spacing.sm}>
            {/* todo: <TokenIcons blockchainId={params.network} tokens={zip(tokens, tokenAddresses).map(([symbol = '?', address = zeroAddress]) => ({ symbol, address }))} />*/}
            <TokenPair
              size="md"
              chain={params.network}
              assets={{
                primary: { symbol: inputToken, address: route.inputCoinAddress },
                secondary: { symbol: outputToken, address: route.outputCoinAddress },
              }}
              hideChainIcon
            />
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
