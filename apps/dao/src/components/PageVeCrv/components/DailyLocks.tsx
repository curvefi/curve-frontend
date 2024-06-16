import styled from 'styled-components'
import { useEffect } from 'react'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'

import Box from '@/ui/Box'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import ErrorMessage from '@/components/ErrorMessage'
import PositiveAndNegativeBarChart from './PositiveAndNegativeBarChart'

const DailyLocks = () => {
  const { getVeCrvLocks, veCrvLocks } = useStore((state) => state.vecrv)

  const locksFetchSuccess = veCrvLocks.fetchStatus === 'SUCCESS'
  const locksFetchError = veCrvLocks.fetchStatus === 'ERROR'
  const locksFetchLoading = veCrvLocks.fetchStatus === 'LOADING'

  useEffect(() => {
    if (veCrvLocks.locks.length === 0 && veCrvLocks.fetchStatus !== 'ERROR') {
      getVeCrvLocks()
    }
  }, [getVeCrvLocks, veCrvLocks.locks.length, veCrvLocks.fetchStatus])

  return (
    <Wrapper variant="secondary">
      <BoxTitle>{t`Daily veCRV Locks Last 100 Days`}</BoxTitle>
      <Content>
        {locksFetchLoading && (
          <StyledSpinnerWrapper>
            <Spinner />
          </StyledSpinnerWrapper>
        )}
        {locksFetchError && <ErrorMessage message={t`Error fetching daily veCRV locks`} onClick={getVeCrvLocks} />}
        {locksFetchSuccess && <PositiveAndNegativeBarChart data={veCrvLocks.locks.slice(256, 356)} />}
      </Content>
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  width: 100%;
  margin-bottom: auto;
`

const BoxTitle = styled.h2`
  font-size: var(--font-size-3);
  font-weight: bold;
  padding: var(--spacing-3);
`

const Content = styled.div`
  padding: 0 var(--spacing-3) var(--spacing-3);
`

const StyledSpinnerWrapper = styled(SpinnerWrapper)`
  display: flex;
  width: 100%;
  margin-bottom: var(--spacing-4);
`

export default DailyLocks
