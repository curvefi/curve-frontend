import type { DetailInfoLeverageExpectedProps, Hop } from '@/lend/components/DetailInfoLeverageAdvancedExpected/types'
import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import apiLending from '@/lend/lib/apiLending'
import networks from '@/lend/networks'
import Box from '@/ui/Box'
import ExternalLink from '@/ui/Link/ExternalLink'
import RouteLine from '@/lend/components/DetailInfoLeverageAdvancedExpected/components/RouteLine'
import RouteToken from '@/lend/components/DetailInfoLeverageAdvancedExpected/components/RouteToken'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'

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
  routeImage,
  avgPrice,
}: Pick<
  DetailInfoLeverageExpectedProps,
  'rChainId' | 'swapFromAmounts' | 'swapToAmounts' | 'routeImage' | 'avgPrice'
> & {
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

    if (routesRef.current) {
      const { height } = routesRef.current.getBoundingClientRect()
      state.height = `${height}px`
    }

    setData(state)
  }, [networkId])

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
          {routeImage && (
            <Box grid gridGap={1}>
              <HopsWrapper ref={routesRef} flex gridGap={2} $minHeight={minHeight}>
                {minHeight && (
                  <StyledSpinnerWrapper $minHeight={minHeight}>
                    <Spinner />
                  </StyledSpinnerWrapper>
                )}

                <img src={routeImage} alt="route" />
              </HopsWrapper>
            </Box>
          )}

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
        <ExternalLink $noStyles href="https://www.odos.xyz/">
          Odos
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
