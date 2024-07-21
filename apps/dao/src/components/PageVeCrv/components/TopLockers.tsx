import styled from 'styled-components'
import { useEffect, useCallback } from 'react'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'
import { TOP_LOCKER_FILTERS } from '@/components/PageVeCrv/constants'

import Box from '@/ui/Box'
import Button from '@/ui/Button'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import SelectSortingMethod from '@/ui/Select/SelectSortingMethod'
import ErrorMessage from '@/components/ErrorMessage'
import BarChartComponent from '@/components/PageVeCrv/components/BarChartComponent'

const TopLockers = () => {
  const { getVeCrvTopLockers, veCrvTopLockers, topLockerFilter, setTopLockerFilter } = useStore((state) => state.vecrv)

  const lockersFetchSuccess = veCrvTopLockers.fetchStatus === 'SUCCESS'
  const lockersFetchError = veCrvTopLockers.fetchStatus === 'ERROR'
  const lockersFetchLoading = veCrvTopLockers.fetchStatus === 'LOADING'

  const handleSortingMethodChange = useCallback(
    (key: React.Key) => {
      setTopLockerFilter(key as TopLockerFilter)
    },
    [setTopLockerFilter]
  )

  useEffect(() => {
    if (veCrvTopLockers.topLockers.length === 0 && veCrvTopLockers.fetchStatus !== 'ERROR') {
      getVeCrvTopLockers()
    }
  }, [getVeCrvTopLockers, veCrvTopLockers.topLockers.length, veCrvTopLockers.fetchStatus])

  return (
    <Wrapper variant="secondary">
      <TitleRow>
        <BoxTitle>{t`Top 50 veCRV Lockers`}</BoxTitle>
        <Box flex flexGap="var(--spacing-1)">
          <SelectSortingMethod
            selectedKey={topLockerFilter}
            minWidth="9rem"
            items={TOP_LOCKER_FILTERS}
            onSelectionChange={handleSortingMethodChange}
          />
        </Box>
      </TitleRow>
      <Content>
        {lockersFetchLoading && (
          <StyledSpinnerWrapper>
            <Spinner />
          </StyledSpinnerWrapper>
        )}
        {lockersFetchError && (
          <ErrorMessage message={t`Error fetching daily veCRV lockers`} onClick={getVeCrvTopLockers} />
        )}
        {lockersFetchSuccess && <BarChartComponent data={veCrvTopLockers.topLockers} filter={topLockerFilter} />}
      </Content>
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  width: 100%;
  margin-bottom: auto;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3);
`

const BoxTitle = styled.h2`
  font-size: var(--font-size-3);
  font-weight: bold;
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
