import type { DetailInfoLeverageExpectedProps, Hop } from '@/components/DetailInfoLeverageAdvancedExpected/types'
import type { T1inchRouteStep } from '@curvefi/lending-api/lib/interfaces'

import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { formatNumber } from '@/ui/utils'
import apiLending from '@/lib/apiLending'
import networks from '@/networks'

import Box from '@/ui/Box'
import ExternalLink from '@/ui/Link/ExternalLink'
import HopSteps from '@/components/DetailInfoLeverageAdvancedExpected/components/HopSteps'
import RouteLine from '@/components/DetailInfoLeverageAdvancedExpected/components/RouteLine'
import RouteToken from '@/components/DetailInfoLeverageAdvancedExpected/components/RouteToken'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import TextCaption from '@/ui/TextCaption'

const stateDefault = { height: '34px', data: [] as Hop[] }

const ExpectedSwapDetails = ({
  rChainId,
  label,
  loading,
  swapFromSymbol,
  swapFromAddress,
  swapFromAmounts,
  swapToSymbol,
  swapToAddress,
  swapToAmounts,
  routes,
  avgPrice,
}: Pick<DetailInfoLeverageExpectedProps, 'rChainId' | 'swapFromAmounts' | 'swapToAmounts' | 'routes' | 'avgPrice'> & {
  label: React.ReactNode
  loading: boolean
  swapFromSymbol: string
  swapFromAddress: string
  swapToSymbol: string
  swapToAddress: string
}) => {
  const routesRef = useRef<HTMLDivElement>(null)
  const [{ height, data }, setData] = useState<{ height: string; data: Hop[] }>(stateDefault)

  const networkId = networks[rChainId].id

  useEffect(() => {
    setData((prev) => ({ ...stateDefault, height: prev.height }))
    let state = { height: '', data: [] as Hop[] }

    if (Array.isArray(routes)) {
      routes.forEach(({ part, hops }) => {
        let parsedSteps: { name: string; part: number; fromTokenAddress: string; toTokenAddress: string }[][] = []

        hops.forEach((steps) => parsedSteps.push(_parseSteps(steps, networkId)))
        state.data.push({ hops: parsedSteps, part })
      })
    }

    if (routesRef.current) {
      const { height } = routesRef.current.getBoundingClientRect()
      state.height = `${height}px`
    }

    setData(state)
  }, [routes, networkId])

  const imageBaseUrl = apiLending.helpers.getImageBaseUrl(rChainId)
  const swapFromTotal = _getTotal(swapFromAmounts.map(({ value }) => value))
  const swapToTotal = _getTotal(swapToAmounts)
  const minHeight = loading && data.length === 0 && swapFromTotal > 0 ? height : ''

  return (
    <Wrapper>
      {label}
      <DetailInfoRoute>
        <RouteLine />

        <Box grid gridGap={3}>
          {/* trade from */}
          <RouteToken
            imageBaseUrl={imageBaseUrl}
            tokenSymbol={swapFromSymbol}
            tokenAddress={swapFromAddress}
            value={swapFromTotal}
          />

          {/* trade routes */}
          <Box grid gridGap={1}>
            <HopsWrapper ref={routesRef} flex gridGap={2} $minHeight={minHeight}>
              {minHeight && (
                <StyledSpinnerWrapper $minHeight={minHeight}>
                  <Spinner />
                </StyledSpinnerWrapper>
              )}

              {data.map(({ hops, part }, hIdx) => {
                return (
                  <HopWrapper key={`hop${hIdx}`} $isFirst={hIdx === 0}>
                    <HopPart>
                      <span>{formatNumber(part, { style: 'percent' })}</span>
                    </HopPart>
                    {hops.map((steps, idx) => {
                      return (
                        <HopSteps
                          key={`route${hIdx}${idx}`}
                          fromTokenAddress={steps[0].fromTokenAddress}
                          imageBaseUrl={imageBaseUrl}
                          showNextArrow={hops.length - 1 !== idx}
                          steps={steps}
                        />
                      )
                    })}
                  </HopWrapper>
                )
              })}
            </HopsWrapper>
          </Box>

          {/* trade to */}
          <RouteToken
            imageBaseUrl={imageBaseUrl}
            tokenSymbol={swapToSymbol}
            tokenAddress={swapToAddress}
            value={swapToTotal}
            avgPrice={avgPrice}
          />
        </Box>
      </DetailInfoRoute>
      <Footer>
        Routing is provided through{' '}
        <ExternalLink $noStyles href="https://1inch.io/">
          1inch
        </ExternalLink>
        .{' '}
      </Footer>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  padding: var(--spacing-3);
  padding-bottom: var(--spacing-1);
`

const StyledSpinnerWrapper = styled(SpinnerWrapper)<{ $minHeight: string }>`
  padding: 0;
  position: absolute;
  min-height: ${({ $minHeight }) => `calc(${$minHeight} - var(--spacing-4))`};
  width: 276px;
`

const DetailInfoRoute = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-gap: var(--spacing-2);
`

const HopsWrapper = styled(Box)<{ $minHeight: string }>`
  background-color: var(--whitea10);
  border: 1px solid var(--border-400);
  ${({ $minHeight }) => $minHeight && `min-height: calc(${$minHeight} + var(--spacing-2));`};
  padding: var(--spacing-2);
  overflow-x: auto;
`

const HopWrapper = styled.div<{ $isFirst: boolean }>`
  ${({ $isFirst }) => {
    if ($isFirst) return `padding-right: var(--spacing-2);`

    return `
      border-left: 1px solid var(--border-400);
      padding-left: var(--spacing-2);
    `
  }}
`

const HopPart = styled(TextCaption).attrs(() => ({ isBold: true, isCaps: true }))`
  display: inline-block;
  margin-bottom: var(--spacing-3);
`

const Footer = styled.footer`
  padding-top: var(--spacing-3);
  font-size: var(--font-size-2);
  opacity: 0.8;
`

export default ExpectedSwapDetails

function _getTotal(amounts: (string | undefined)[]) {
  return amounts.reduce((prev, curr) => {
    prev += +(curr ?? '0')
    return prev
  }, 0)
}

function _parseName(routeName: string, networkId: string) {
  let routeNameArr = routeName.split('_')
  if (routeNameArr[0]?.toLowerCase() === networkId.toLowerCase()) routeNameArr.shift()
  return routeNameArr.join(' ')
}

function _parseSteps(steps: T1inchRouteStep, networkId: string) {
  return steps.map(({ name, part, fromTokenAddress, toTokenAddress }) => {
    return {
      name: _parseName(name, networkId),
      part,
      fromTokenAddress,
      toTokenAddress,
    }
  })
}
