import type { Params } from 'react-router'
import type { Route } from '@/dex/components/PageRouterSwap/types'

import { t } from '@lingui/macro'
import styled from 'styled-components'

import useStore from '@/dex/store/useStore'

import { RCCircle } from '@/images'
import Box from '@/ui/Box'
import DetailInfoTradeRouteRoute from '@/dex/components/PageRouterSwap/components/DetailInfoTradeRouteRoute'
import Loader from '@/ui/Loader'

const DetailInfoTradeRoute = ({
  params,
  loading,
  routes,
  tokensNameMapper,
}: {
  params: Params
  loading: Boolean
  routes: Route[]
  tokensNameMapper: TokensNameMapper
}) => {
  const routesLength = Array.isArray(routes) ? routes.length : 0
  const isMultiRoutes = routesLength > 1
  const detailRowJustifyContent = isMultiRoutes ? 'flex-start' : 'flex-end'

  return (
    <Wrapper grid gridAutoFlow={isMultiRoutes ? 'row' : 'column'}>
      <Label as="strong">{t`Trade routed through:`}</Label>
      <Detail
        grid
        gridAutoFlow="row"
        flexJustifyContent={detailRowJustifyContent}
        gridRowGap={1}
        padding={isMultiRoutes ? '0 0 0 var(--spacing-1)' : ''}
      >
        {loading ? (
          <Loader skeleton={[130, 22.6 * (routesLength || 1)]} />
        ) : routesLength > 0 ? (
          <Box grid gridAutoFlow="column" gridColumnGap="1" flexJustifyContent={detailRowJustifyContent}>
            {routesLength > 1 && (
              <RouteTravelDecor>
                <CircleIcon />
                <RouteTravelBar></RouteTravelBar>
                <CircleIcon />
              </RouteTravelDecor>
            )}
            <ul>
              {routes.map((route) => (
                <Item key={`${route.poolId}-${route.outputCoinAddress}`}>
                  <Box flex flexAlignItems="baseline">
                    <DetailInfoTradeRouteRoute
                      params={params}
                      route={route}
                      routesLength={routesLength}
                      tokensNameMapper={tokensNameMapper}
                    />
                  </Box>
                </Item>
              ))}
            </ul>
          </Box>
        ) : (
          '-'
        )}
      </Detail>
    </Wrapper>
  )
}

const Item = styled.li`
  white-space: nowrap;
  text-align: left;
`

const RouteTravelBar = styled.div`
  border-left: 2px dotted;
  margin: -1px 0 -3px 3px;
  height: 100%;
  opacity: 0.5;
`

const CircleIcon = styled(RCCircle)`
  width: 0.5rem;
  height: 0.5rem;
  fill: currentColor;
`

const RouteTravelDecor = styled.div`
  height: calc(100% - 34px);
  margin-left: var(--spacing-1);
  margin-top: 0.1875rem; // 3px
  opacity: 0.7;
`

const Detail = styled(Box)`
  padding-bottom: var(--spacing-1);
`

const Label = styled(Box)`
  padding-bottom: var(--spacing-1);
`

const Wrapper = styled(Box)`
  font-size: var(--font-size-2);
`

export default DetailInfoTradeRoute
