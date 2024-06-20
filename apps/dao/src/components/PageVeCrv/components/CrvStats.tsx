import { useEffect } from 'react'
import styled from 'styled-components'

import useStore from '@/store/useStore'
import { formatNumber } from '@/ui/utils'

import Box from '@/ui/Box'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'

const CrvStats = () => {
  const { provider } = useStore((state) => state.wallet)
  const { veCrvData, getVeCrvData } = useStore((state) => state.vecrv)

  useEffect(() => {
    if (provider && veCrvData.totalCrv === 0 && veCrvData.fetchStatus !== 'ERROR') {
      getVeCrvData(provider)
    }
  }, [veCrvData.totalCrv, veCrvData.fetchStatus, getVeCrvData, provider])

  return (
    <Wrapper variant="secondary">
      {veCrvData.fetchStatus === 'LOADING' && (
        <StyledSpinnerWrapper>
          <Spinner />
        </StyledSpinnerWrapper>
      )}
      {veCrvData.fetchStatus === 'SUCCESS' && (
        <StatsRow>
          <Column>
            <ColumnTitle>Total CRV</ColumnTitle>
            <ColumnData>{formatNumber(veCrvData.totalCrv, { showDecimalIfSmallNumberOnly: true })}</ColumnData>
          </Column>
          <Column>
            <ColumnTitle>Total veCRV</ColumnTitle>
            <ColumnData>{formatNumber(veCrvData.totalVeCrv, { showDecimalIfSmallNumberOnly: true })}</ColumnData>
          </Column>
          <Column>
            <ColumnTitle>Locked Percentage</ColumnTitle>
            <ColumnData>{veCrvData.lockedPercentage.toFixed(2)}%</ColumnData>
          </Column>
        </StatsRow>
      )}
    </Wrapper>
  )
}

const Wrapper = styled(Box)``

const StyledSpinnerWrapper = styled(SpinnerWrapper)`
  display: flex;
  width: 100%;
  margin-bottom: var(--spacing-4);
`

const StatsRow = styled(Box)`
  display: flex;
  flex-direction: row;
  gap: var(--spacing-4);
  padding: var(--spacing-3);
  background-color: var(--box_header--secondary--background-color);
`

const Column = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  font-size: var(--font-size-3);
  font-weight: var(--semi-bold);
`

const ColumnTitle = styled.h4`
  font-size: var(--font-size-1);
  opacity: 0.5;
  &.align-right {
    @media (min-width: 32.5rem) {
      text-align: right;
    }
  }
`

const ColumnData = styled.h3`
  font-size: var(--font-size-2);
`

export default CrvStats
