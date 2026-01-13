import lodash from 'lodash'
import { useMemo } from 'react'
import { styled } from 'styled-components'
import type { Route } from '@/dex/components/PageRouterSwap/types'
import { ROUTE } from '@/dex/constants'
import { useNetworks } from '@/dex/entities/networks'
import { type UrlParams } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import { Icon } from '@ui/Icon'
import { ExternalLink } from '@ui/Link'
import { TextEllipsis } from '@ui/TextEllipsis'
import { RouterLink as Link } from '@ui-kit/shared/ui/RouterLink'
import { shortenAddress } from '@ui-kit/utils'

export const DetailInfoTradeRouteRoute = ({
  params,
  route,
  routesLength,
  tokensNameMapper,
}: {
  params: UrlParams
  route: Route
  routesLength: number
  tokensNameMapper: { [address: string]: string }
}) => {
  const inputToken = tokensNameMapper[route.inputCoinAddress] ?? shortenAddress(route.inputCoinAddress) ?? ''
  const outputToken = tokensNameMapper[route.outputCoinAddress] ?? shortenAddress(route.outputCoinAddress) ?? ''
  const { data: networks } = useNetworks()
  const { swapCustomRouteRedirect } =
    Object.values(networks).find(({ networkId }) => networkId === params.network) || {}

  const path = useMemo(() => {
    if (route.poolId && swapCustomRouteRedirect?.[route.poolId]) {
      return { pathname: swapCustomRouteRedirect[route.poolId], isExternal: true }
    } else if (route.routeUrlId) {
      return { pathname: getPath(params, `${ROUTE.PAGE_POOLS}/${route.routeUrlId}/deposit`), isExternal: false }
    }
  }, [params, route.poolId, route.routeUrlId, swapCustomRouteRedirect])

  const labelProps = { maxWidth: '70px', smMaxWidth: '90px' }

  const InputAndOutputTokenLabel =
    (routesLength || 1) > 1 ? (
      <RouteTokenNames>
        <TextEllipsis {...labelProps}>{inputToken}</TextEllipsis> <RouteTokenNameIcon name="ArrowRight" size={16} />{' '}
        <TextEllipsis {...labelProps}>{outputToken}</TextEllipsis>{' '}
      </RouteTokenNames>
    ) : null

  return lodash.isUndefined(path) ? (
    <>
      <strong>{route.name}</strong>
      {InputAndOutputTokenLabel}
    </>
  ) : path.isExternal ? (
    <>
      <ExternalLink $noStyles href={path.pathname} target="_blank">
        <strong>{route.name || route.poolId}</strong>
      </ExternalLink>
      {InputAndOutputTokenLabel}
    </>
  ) : (
    <>
      <RouteName href={path.pathname} target="_blank">
        <strong>{route.name || route.poolId}</strong>
      </RouteName>
      {InputAndOutputTokenLabel}
    </>
  )
}

const RouteTokenNameIcon = styled(Icon)`
  width: 10px;
  margin: 0 var(--spacing-1);
`

const RouteTokenNames = styled.span`
  align-items: center;
  display: inline-flex;
  font-size: var(--font-size-1);
  padding: 1px 3px;
  opacity: 0.7;
  margin-left: 4px;
`

const RouteName = styled(Link)`
  display: inline-block;
  max-width: 180px;
  color: inherit;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
`
