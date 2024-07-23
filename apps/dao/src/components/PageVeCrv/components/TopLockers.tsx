import styled from 'styled-components'
import { useEffect, useCallback, useMemo } from 'react'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'
import { TOP_LOCKER_FILTERS } from '@/components/PageVeCrv/constants'

import Box from '@/ui/Box'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import SelectSortingMethod from '@/ui/Select/SelectSortingMethod'
import ErrorMessage from '@/components/ErrorMessage'
import TopLockerBarChartComponent from '@/components/PageVeCrv/components/TopLockerBarChartComponent'

const TopLockers: React.FC = () => {
  const { getVeCrvTopLockers, veCrvTopLockers, topLockerFilter, setTopLockerFilter, veCrvData } = useStore(
    (state) => state.vecrv
  )

  const lockersFetchSuccess = veCrvTopLockers.fetchStatus === 'SUCCESS'
  const lockersFetchError = veCrvTopLockers.fetchStatus === 'ERROR'
  const lockersFetchLoading = veCrvTopLockers.fetchStatus === 'LOADING'

  const handleSortingMethodChange = useCallback(
    (key: React.Key) => {
      setTopLockerFilter(key as TopLockerFilter)
    },
    [setTopLockerFilter]
  )

  const othersData: VeCrvTopLocker = useMemo(() => {
    if (!lockersFetchSuccess || veCrvData.fetchStatus !== 'SUCCESS')
      return {
        user: 'Others(<0.5%)',
        weight: 0,
        locked: 0,
        weight_ratio: 0,
        unlock_time: 'N/A',
      }

    const othersVeCrv = veCrvData.totalVeCrv - veCrvTopLockers.totalValues.weight
    const otherLockedCrv = veCrvData.totalLockedCrv - veCrvTopLockers.totalValues.locked
    const othersWeightRatio = 100 - veCrvTopLockers.totalValues.weight_ratio

    return {
      user: 'Others(<0.3%)',
      weight: othersVeCrv,
      locked: otherLockedCrv,
      weight_ratio: othersWeightRatio,
      unlock_time: 'N/A',
    }
  }, [
    lockersFetchSuccess,
    veCrvData.fetchStatus,
    veCrvData.totalLockedCrv,
    veCrvData.totalVeCrv,
    veCrvTopLockers.totalValues.locked,
    veCrvTopLockers.totalValues.weight,
    veCrvTopLockers.totalValues.weight_ratio,
  ])

  useEffect(() => {
    if (veCrvTopLockers.topLockers.length === 0 && veCrvTopLockers.fetchStatus !== 'ERROR') {
      getVeCrvTopLockers()
    }
  }, [getVeCrvTopLockers, veCrvTopLockers.topLockers.length, veCrvTopLockers.fetchStatus])

  return (
    <Wrapper variant="secondary">
      <TitleRow>
        <BoxTitle>{t`veCRV Holder Distribution`}</BoxTitle>
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
        {lockersFetchError && <ErrorMessage message={t`Error fetching veCRV holders`} onClick={getVeCrvTopLockers} />}
        {lockersFetchSuccess && (
          <TopLockerBarChartComponent data={[...veCrvTopLockers.topLockers, othersData]} filter={topLockerFilter} />
        )}
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
