import { sum } from 'lodash'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { styled } from 'styled-components'
import { Box } from '@ui/Box'
import { ExternalLink } from '@ui/Link/ExternalLink'
import { SpinnerWrapper, Spinner } from '@ui/Spinner'
import type { RouteDetailsProps, Hop } from '../types'
import { RouteLine } from './RouteLine'
import { RouteToken } from './RouteToken'

const stateDefault = { height: '34px', data: [] as Hop[] }

const _getTotal = (amounts: (string | number | undefined)[]) => sum(amounts.map((val) => +(val ?? '0')))

export const ExpectedSwapDetails = ({
  network: networkId,
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
}: Pick<RouteDetailsProps, 'network' | 'swapFromAmounts' | 'swapToAmounts' | 'routeImage' | 'avgPrice'> & {
  label: ReactNode
  loading: boolean
  swapFromSymbol: string
  swapFromAddress: string
  swapToSymbol: string
  swapToAddress: string
}) => {
  const routesRef = useRef<HTMLDivElement>(null)
  const [{ height, data }, setData] = useState<{ height: string; data: Hop[] }>(stateDefault)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData((prev) => ({ ...stateDefault, height: prev.height }))
    const state = { height: '', data: [] as Hop[] }

    if (routesRef.current) {
      const { height } = routesRef.current.getBoundingClientRect()
      state.height = `${height}px`
    }

    setData(state)
  }, [networkId])

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
            blockchainId={networkId}
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
            blockchainId={networkId}
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
