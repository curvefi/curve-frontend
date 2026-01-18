import { useEffect } from 'react'
import { styled } from 'styled-components'
import { ErrorMessage } from '@/dao/components/ErrorMessage'
import { useStore } from '@/dao/store/useStore'
import { Box } from '@ui/Box'
import { formatDate, formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { SpinnerComponent as Spinner } from '../../Spinner'
import { VeCrvFeesChart } from '../VeCrvFeesChart'

export const VeCrcFees = () => {
  const getVeCrvFees = useStore((state) => state.analytics.getVeCrvFees)
  const veCrvFees = useStore((state) => state.analytics.veCrvFees)

  const feesLoading = veCrvFees.fetchStatus === 'LOADING'
  const feesError = veCrvFees.fetchStatus === 'ERROR'
  const feesReady = veCrvFees.fetchStatus === 'SUCCESS'

  useEffect(() => {
    if (veCrvFees.fees.length === 0 && !feesError) {
      void getVeCrvFees()
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
                    <FeeRow key={item.timestamp.getTime()}>
                      <FeeDate>
                        {formatDate(item.timestamp)}
                        {item.timestamp > new Date() && <span> {t`(in progress)`}</span>}
                      </FeeDate>
                      <FeeData>
                        {formatNumber(item.feesUsd, {
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
