import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useEffect } from 'react'

import useStore from '@/store/useStore'
import { formatNumber, convertToLocaleTimestamp } from '@/ui/utils'

import Box from '@/ui/Box'
import Spinner from '@/components/Spinner'
import ErrorMessage from '@/components/ErrorMessage'

interface UserLocksProps {
  userAddress: string
}

const UserLocks: React.FC<UserLocksProps> = ({ userAddress }) => {
  const { getUserLocks, userLocksMapper } = useStore((state) => state.user)

  const userLocks = userLocksMapper[userAddress]

  const locksLoading = userLocks?.fetchingState === 'LOADING' ?? true
  const locksError = userLocks?.fetchingState === 'ERROR' ?? false
  const locksReady = userLocks?.fetchingState === 'SUCCESS' ?? false

  const currentTime = convertToLocaleTimestamp(new Date().getTime() / 1000)

  useEffect(() => {
    if (!userLocksMapper[userAddress] && !locksError) {
      getUserLocks(userAddress)
    }
  }, [getUserLocks, userLocksMapper, userAddress, locksError])

  return (
    <Wrapper>
      <FeesBox flex flexColumn>
        <BoxTitle>{t`User Locks`}</BoxTitle>
        <FeesTitlesRow>
          <FeesSubtitle>{t`Date`}</FeesSubtitle>
          <FeesSubtitle>{t`Amount`}</FeesSubtitle>
        </FeesTitlesRow>
        {locksLoading && <Spinner height="25rem" />}
        {locksError && <ErrorMessage message="Error fetching user locks." onClick={() => getUserLocks(userAddress)} />}
        {locksReady && (
          <>
            <FeesContainer>
              {userLocks.locks.map((item, index) => {
                return (
                  <FeeRow key={`${item.transaction_hash}-${index}`}>
                    <FeeDate>{item.date}</FeeDate>
                    <FeeData>
                      {formatNumber(item.amount, {
                        showDecimalIfSmallNumberOnly: true,
                      })}
                    </FeeData>
                    <FeeData>{item.lock_type}</FeeData>
                    <FeeData>{item.locked_balance}</FeeData>
                  </FeeRow>
                )
              })}
            </FeesContainer>
          </>
        )}
      </FeesBox>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  gap: var(--spacing-2);
  flex-direction: column;
  @media (min-width: 56.25rem) {
    flex-direction: row;
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
`

const BoxTitle = styled.h2`
  font-size: var(--font-size-3);
  font-weight: bold;
  padding: var(--spacing-3);
`

const FeesBox = styled(Box)`
  @media (min-width: 25rem) {
    min-width: 25rem;
  }
`

const FeesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  max-height: 25rem;
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

export default UserLocks
