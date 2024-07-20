import styled from 'styled-components'
import { useEffect } from 'react'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'

import Box from '@/ui/Box'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import ErrorMessage from '@/components/ErrorMessage'
import BarChartComponent from '@/components/PageVeCrv/components/BarChartComponent'

const TopLockers = () => {
  const { getVeCrvTopLockers, veCrvTopLockers } = useStore((state) => state.vecrv)

  const lockersFetchSuccess = veCrvTopLockers.fetchStatus === 'SUCCESS'
  const lockersFetchError = veCrvTopLockers.fetchStatus === 'ERROR'
  const lockersFetchLoading = veCrvTopLockers.fetchStatus === 'LOADING'

  useEffect(() => {
    if (veCrvTopLockers.topLockers.length === 0 && veCrvTopLockers.fetchStatus !== 'ERROR') {
      getVeCrvTopLockers()
    }
  }, [getVeCrvTopLockers, veCrvTopLockers.topLockers.length, veCrvTopLockers.fetchStatus])

  return (
    <Wrapper variant="secondary">
      <BoxTitle>{t`Top 50 veCRV Lockers`}</BoxTitle>
      <Content>
        {lockersFetchLoading && (
          <StyledSpinnerWrapper>
            <Spinner />
          </StyledSpinnerWrapper>
        )}
        {lockersFetchError && (
          <ErrorMessage message={t`Error fetching daily veCRV lockers`} onClick={getVeCrvTopLockers} />
        )}
        {lockersFetchSuccess && <BarChartComponent data={veCrvTopLockers.topLockers} />}
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

export default TopLockers
