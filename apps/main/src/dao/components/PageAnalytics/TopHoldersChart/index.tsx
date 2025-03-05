import styled from 'styled-components'
import { useMemo } from 'react'
import { t } from '@ui-kit/lib/i18n'
import useStore from '@/dao/store/useStore'
import { TOP_HOLDERS_FILTERS } from '@/dao/components/PageAnalytics/constants'
import Box from '@ui/Box'
import Spinner from '../../Spinner'
import SelectSortingMethod from '@ui/Select/SelectSortingMethod'
import ErrorMessage from '@/dao/components/ErrorMessage'
import TopHoldersBarChartComponent from '@/dao/components/PageAnalytics/TopHoldersChart/TopHoldersBarChartComponent'
import type { Locker } from '@curvefi/prices-api/dao'

const TopLockers = () => {
  const { getVeCrvHolders, veCrvHolders, topHoldersSortBy, setTopHoldersSortBy, veCrvData } = useStore(
    (state) => state.analytics,
  )

  const lockersFetchSuccess = veCrvHolders.fetchStatus === 'SUCCESS'
  const lockersFetchError = veCrvHolders.fetchStatus === 'ERROR'
  const lockersFetchLoading = veCrvHolders.fetchStatus === 'LOADING'

  const othersData: Locker = useMemo(() => {
    if (!lockersFetchSuccess || veCrvData.fetchStatus !== 'SUCCESS')
      return {
        user: 'Others(<0.5%)' as `Others(${string})`,
        weight: 0n,
        locked: 0n,
        weightRatio: 0,
        unlockTime: null,
      }

    const othersVeCrv = veCrvData.totalVeCrv - veCrvHolders.totalValues.weight
    const otherLockedCrv = veCrvData.totalLockedCrv - veCrvHolders.totalValues.locked
    const othersWeightRatio = +(100 - veCrvHolders.totalValues.weightRatio).toFixed(2)

    return {
      user: 'Others(<0.3%)' as `Others(${string})`,
      weight: othersVeCrv,
      locked: otherLockedCrv,
      weightRatio: othersWeightRatio,
      unlockTime: null,
    }
  }, [
    lockersFetchSuccess,
    veCrvData.fetchStatus,
    veCrvData.totalLockedCrv,
    veCrvData.totalVeCrv,
    veCrvHolders.totalValues.locked,
    veCrvHolders.totalValues.weight,
    veCrvHolders.totalValues.weightRatio,
  ])

  return (
    <Wrapper>
      <TitleRow>
        <BoxTitle>{t`veCRV Holder Distribution`}</BoxTitle>
        <Box flex flexGap="var(--spacing-1)">
          <SelectSortingMethod
            selectedKey={topHoldersSortBy}
            minWidth="9rem"
            items={TOP_HOLDERS_FILTERS}
            onSelectionChange={setTopHoldersSortBy}
          />
        </Box>
      </TitleRow>
      <Content>
        {lockersFetchLoading && <Spinner height="18.75rem" />}
        {lockersFetchError && <ErrorMessage message={t`Error fetching veCRV holders`} onClick={getVeCrvHolders} />}
        {lockersFetchSuccess && (
          <TopHoldersBarChartComponent data={[...veCrvHolders.topHolders, othersData]} filter={topHoldersSortBy} />
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

const BoxTitle = styled.h4`
  font-size: var(--font-size-3);
  font-weight: bold;
`

const Content = styled.div`
  padding: 0 var(--spacing-3) var(--spacing-3);
`

export default TopLockers
