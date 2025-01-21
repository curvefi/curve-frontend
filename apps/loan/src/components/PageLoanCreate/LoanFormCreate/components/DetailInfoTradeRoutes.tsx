import { t } from '@lingui/macro'
import React, { useMemo } from 'react'
import styled from 'styled-components'

import { formatNumber } from '@ui/utils'
import { RCCircle } from '@ui/images'
import Box from '@ui/Box'
import Loader from '@ui/Loader'

const DetailInfoTradeRoutes = ({
  input,
  inputSymbol,
  isValidFormValues = true,
  loading,
  output,
  outputSymbol,
  routes,
}: {
  input: string
  inputSymbol: string
  isValidFormValues?: boolean
  loading: boolean
  output: string | number
  outputSymbol: string
  routes: string
}) => {
  const parsedRoutes = useMemo(() => {
    if (routes) {
      const delimiterPattern = /\s*-->\s*|\s*->\s*/
      return routes.split(delimiterPattern)
    } else {
      return []
    }
  }, [routes])

  const routesLength = parsedRoutes.length
  const isMultiRoutes = routesLength > 1
  const detailRowJustifyContent = isMultiRoutes ? 'flex-start' : 'flex-end'

  return (
    <Wrapper grid gridAutoFlow="row">
      <Label isMultiRoutes>{t`Trade routed through:`}</Label>
      <Detail isMultiRoutes>
        {loading ? (
          <Loader skeleton={[130, 19 * (routesLength || 1)]} />
        ) : isValidFormValues && routesLength > 0 ? (
          <DetailInfoRoute
            grid
            gridAutoFlow="column"
            gridColumnGap="1"
            gridTemplateColumns={routesLength === 1 ? '1fr' : 'auto 1fr'}
            flexJustifyContent={detailRowJustifyContent}
            isMultiRoutes={isMultiRoutes}
          >
            {routesLength > 1 && (
              <RouteTravelDecor>
                <CircleIcon />
                <RouteTravelBar></RouteTravelBar>
                <CircleIcon />
              </RouteTravelDecor>
            )}
            <ul>
              {parsedRoutes.map((route, idx) => {
                const from =
                  idx === 0 && input ? (
                    <>
                      {formatNumber(input)} {inputSymbol}
                    </>
                  ) : (
                    ''
                  )

                const to =
                  idx === parsedRoutes.length - 1 && output ? (
                    <>
                      receive {formatNumber(output)} {outputSymbol}
                    </>
                  ) : (
                    ''
                  )
                return (
                  <Item key={`${route}`}>
                    <Box flex flexAlignItems="baseline" flexJustifyContent="space-between">
                      <RouteName title={route}>{route}</RouteName>{' '}
                      <RouteTradedInfo>{!isMultiRoutes ? to || '' : from || to || ''}</RouteTradedInfo>
                    </Box>
                  </Item>
                )
              })}
            </ul>
          </DetailInfoRoute>
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

const RouteTradedInfo = styled.span`
  font-size: var(--font-size-1);
  font-weight: bold;
  padding: 1px 3px;
  opacity: 0.7;
  margin-left: 4px;
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

const Detail = styled(Box)<{ isMultiRoutes: boolean }>`
  padding-bottom: var(--spacing-1);
  ${({ isMultiRoutes }) => {
    if (!isMultiRoutes) {
      return `
        display: grid;
        grid-direction: row;
        grid-row-gap: 1;
        justify-content: flex-end;
        min-height: 1.7rem;
      `
    }
  }}
`

const DetailInfoRoute = styled(Box)<{ isMultiRoutes: boolean }>`
  ${({ isMultiRoutes }) => (!isMultiRoutes ? `margin-left: 10px;` : '')}
`

const Label = styled.strong<{ isMultiRoutes: boolean }>`
  padding-bottom: var(--spacing-1);

  ${({ isMultiRoutes }) => {
    if (isMultiRoutes) {
      return `
        padding-top: 6px;
      `
    } else {
      return `
        align-items: center;
        display: flex;
        min-height: 1.7rem;
      `
    }
  }}
`

const Wrapper = styled(Box)`
  font-size: var(--font-size-2);
`

const RouteName = styled.strong`
  display: inline-block;
  max-width: 120px;
  color: inherit;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
`

export default DetailInfoTradeRoutes
