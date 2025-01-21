import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useEffect } from 'react'

import useStore from '@dao/store/useStore'
import { formatNumber, convertToLocaleTimestamp } from '@ui/utils'

import Box from '@ui/Box'
import Spinner from '../../Spinner'
import ErrorMessage from '@dao/components/ErrorMessage'
import VeCrvFeesChart from '../VeCrvFeesChart'

const VeCrcFees: React.FC = () => {
  const { getVeCrvFees, veCrvFees } = useStore((state) => state.analytics)

  const feesLoading = veCrvFees.fetchStatus === 'LOADING'
  const feesError = veCrvFees.fetchStatus === 'ERROR'
  const feesReady = veCrvFees.fetchStatus === 'SUCCESS'

  const currentTime = convertToLocaleTimestamp(new Date().getTime() / 1000)

  useEffect(() => {
    if (veCrvFees.fees.length === 0 && !feesError) {
      getVeCrvFees()
    }
  }, [getVeCrvFees, veCrvFees, feesError])

  return (
    <Wrapper>
      {feesLoading ? (
        <Spinner height="27.125rem" />
      ) : (
        <>
          <VeCrvFeesChart />
          <FeesBox flex flexColumn>
            <FeesTitlesRow>
              <FeesSubtitle>{t`Distribution Date`}</FeesSubtitle>
              <FeesSubtitle>{t`Fees`}</FeesSubtitle>
            </FeesTitlesRow>
            {feesLoading && <Spinner height="27.125rem" />}
            {feesError && <ErrorMessage message="Error fetching veCRV historical fees" onClick={getVeCrvFees} />}
            {feesReady && (
              <>
                <FeesContainer>
                  {veCrvFees.fees.map((item) => (
                    <FeeRow key={item.date}>
                      <FeeDate>
                        {item.date}
                        {item.timestamp > currentTime && <span> {t`(in progress)`}</span>}
                      </FeeDate>
                      <FeeData>
                        {formatNumber(item.fees_usd, {
                          currency: 'USD',
                          notation: 'compact',
                        })}
                      </FeeData>
                    </FeeRow>
                  ))}
                </FeesContainer>
                <TotalFees>
                  <FeeDate>{t`Total Fees:`}</FeeDate>
                  <FeeData>{formatNumber(veCrvFees.veCrvTotalFees, { currency: 'USD', notation: 'compact' })}</FeeData>
                </TotalFees>
              </>
            )}
          </FeesBox>
        </>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  gap: var(--spacing-2);
  flex-direction: column;
  @media (min-width: 56.25rem) {
    flex-direction: row;
    grid-template-columns: 25rem 1fr;
  }
`

const FeesBox = styled(Box)`
  padding-top: var(--spacing-3);
  @media (min-width: 25rem) {
    min-width: 25rem;
  }
`

const FeesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  max-height: 27.125rem;
  overflow-y: auto;
  padding: var(--spacing-1) var(--spacing-3);
`

const FeesTitlesRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--spacing-5);
  justify-content: space-between;
  padding: var(--spacing-2) var(--spacing-3) var(--spacing-2);
`

const FeesSubtitle = styled.h4`
  font-size: var(--font-size-1);
  font-weight: bold;
  opacity: 0.5;
`

const FeeRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-3);
  justify-content: space-between;
  border-bottom: 1px solid var(--gray-500a20);
  padding-bottom: var(--spacing-2);
  &:last-child {
    border-bottom: none;
  }
`

const FeeData = styled.p`
  font-size: var(--font-size-2);
  font-weight: bold;
  font-variant-numeric: tabular-nums;
  text-align: right;
`

const FeeDate = styled(FeeData)`
  text-align: left;
  font-weight: var(--semi-bold);
`

const TotalFees = styled.div`
  display: flex;
  justify-content: space-between;
  border-top: 1px solid var(--gray-500a20);
  padding: var(--spacing-3);
  margin-top: var(--spacing-3);
`

export default VeCrcFees
