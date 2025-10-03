import { ComponentProps } from 'react'
import { styled } from 'styled-components'
import DetailInfoTradeRouteRoute from '@/dex/components/PageRouterSwap/components/DetailInfoTradeRouteRoute'
import type { Route } from '@/dex/components/PageRouterSwap/types'
import { type NetworkUrlParams, TokensNameMapper } from '@/dex/types/main.types'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Stack from '@mui/material/Stack'
import Box from '@ui/Box'
import { RCCircle } from '@ui/images'
import Loader from '@ui/Loader'
import { useReleaseChannel } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { CircleIcon as NewCircleIcon } from '@ui-kit/shared/icons/CircleIcon'
import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ReleaseChannel } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

const OldDetailInfoTradeRoute = ({
  params,
  loading,
  routes,
  tokensNameMapper,
}: {
  params: NetworkUrlParams
  loading: boolean
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
          <Loader skeleton={[180, 22.6 * (routesLength || 1)]} />
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

const Circle = () => <NewCircleIcon sx={{ width: '0.5rem', height: '0.5rem', fill: 'currentColor' }} />

const RouteTrack = () => (
  <Stack
    direction="column"
    justifyContent="center"
    alignItems="center"
    sx={{ marginBlock: '6px 14px', opacity: '0.7' }} // aligns with the 1st and last items
  >
    <Circle />
    <Stack sx={{ borderLeft: '2px dotted', height: '100%', opacity: '0.5' }} />
    <Circle />
  </Stack>
)

export const NewDetailInfoTradeRoute = ({
  params,
  loading,
  routes,
  tokensNameMapper,
}: ComponentProps<typeof OldDetailInfoTradeRoute>) => (
  <ActionInfo
    label={t`Trade routed through:`}
    value={
      routes?.length ? (
        <Stack direction="row" gap={Spacing.sm}>
          {routes.length > 1 && <RouteTrack />}
          <List sx={{ paddingTop: 0, ...(routes.length <= 1 && { paddingBottom: 0 }) }}>
            {routes.map((route) => (
              <ListItem
                key={`${route.poolId}-${route.outputCoinAddress}`}
                sx={(t) => ({ whiteSpace: 'nowrap', padding: 0, ...t.typography.bodySRegular })}
              >
                <DetailInfoTradeRouteRoute
                  params={params}
                  route={route}
                  routesLength={routes.length}
                  tokensNameMapper={tokensNameMapper}
                />
              </ListItem>
            ))}
          </List>
        </Stack>
      ) : (
        '-'
      )
    }
    {...(routes && routes.length > 1 && { flexWrap: 'wrap', alignItems: 'start' })}
    loading={loading && [180, 24]}
  />
)

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

export default function DetailInfoTradeRoute(props: ComponentProps<typeof NewDetailInfoTradeRoute>) {
  const [releaseChannel] = useReleaseChannel()
  const DetailInfoTradeRoute =
    releaseChannel === ReleaseChannel.Beta ? NewDetailInfoTradeRoute : OldDetailInfoTradeRoute
  return <DetailInfoTradeRoute {...props} />
}
