import type { Params } from 'react-router'
import type { Route } from '@/dex/components/PageRouterSwap/types'

import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import isUndefined from 'lodash/isUndefined'
import styled from 'styled-components'

import { ROUTE } from '@/dex/constants'
import { getPath } from '@/dex/utils/utilsRouter'
import { shortenTokenAddress } from '@/dex/utils'

import { ExternalLink } from '@ui/Link'
import Icon from '@ui/Icon'
import TextEllipsis from '@ui/TextEllipsis'
import useStore from '@/dex/store/useStore'

const DetailInfoTradeRouteRoute = ({
  params,
  route,
  routesLength,
  tokensNameMapper,
}: {
  params: Params
  route: Route
  routesLength: number
  tokensNameMapper: { [address: string]: string }
}) => {
  const inputToken = tokensNameMapper[route.inputCoinAddress] ?? shortenTokenAddress(route.inputCoinAddress) ?? ''
  const outputToken = tokensNameMapper[route.outputCoinAddress] ?? shortenTokenAddress(route.outputCoinAddress) ?? ''
  const networks = useStore((state) => state.networks.networks)
  const networksIdMapper = useStore((state) => state.networks.networksIdMapper)
  const networkId = params?.network ? networksIdMapper[params.network.toLowerCase() as NetworkEnum] : null
  const network = networkId ? networks[networkId as ChainId] : null
  const { swapCustomRouteRedirect } = network || {}

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

  return isUndefined(path) ? (
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
      <RouteName to={path.pathname} target="_blank">
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
  max-width: 130px;
  color: inherit;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
`

export default DetailInfoTradeRouteRoute
