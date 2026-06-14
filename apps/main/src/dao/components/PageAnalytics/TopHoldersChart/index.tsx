import { useMemo } from 'react'
import { styled } from 'styled-components'
import { TOP_HOLDERS_FILTERS } from '@/dao/components/PageAnalytics/constants'
import { TopHoldersBarChart as TopHoldersBarChartComponent } from '@/dao/components/PageAnalytics/TopHoldersChart/TopHoldersBarChartComponent'
import { useStatsVecrvQuery } from '@/dao/entities/stats-vecrv'
import { useVeCrvHoldersQuery, type VeCrvHolder } from '@/dao/entities/vecrv-holders'
import { useStore } from '@/dao/store/useStore'
import type { TopHoldersSortBy } from '@/dao/types/dao.types'
import MuiBox from '@mui/material/Box'
import { sortBy } from '@primitives/array.utils'
import { Box } from '@ui/Box'
import { SelectSortingMethod } from '@ui/Select/SelectSortingMethod'
import { t } from '@ui-kit/lib/i18n'
import { ChartStateWrapper } from '@ui-kit/shared/ui/Chart'
import { decimal, decimalMinus, decimalSum } from '@ui-kit/utils'

const CHART_HEIGHT = 300
const TOP_HOLDERS_LIMIT = 100
const MIN_TOP_HOLDER_WEIGHT_RATIO = 0.3

export const TopLockers = () => {
  const { data: veCrvData, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useStatsVecrvQuery({})
  const {
    data: veCrvHolders,
    isLoading: holdersLoading,
    error: holdersError,
    refetch: refetchHolders,
  } = useVeCrvHoldersQuery({})
  const topHoldersSortBy = useStore(state => state.analytics.topHoldersSortBy)
  const setTopHoldersSortBy = useStore(state => state.analytics.setTopHoldersSortBy)

  const chartError = holdersError ?? statsError
  const isLoading = holdersLoading || statsLoading

  const chartData: VeCrvHolder[] = useMemo(() => {
    if (!veCrvHolders || !veCrvData) return []

    const topHolders = sortBy(veCrvHolders, holder => +holder.weightRatio, 'desc')
      .slice(0, TOP_HOLDERS_LIMIT)
      .filter(holder => +holder.weightRatio > MIN_TOP_HOLDER_WEIGHT_RATIO)
    const totalValues = topHolders.reduce(
      (acc, holder) => ({
        weight: decimalSum(acc.weight, holder.weight),
        locked: decimalSum(acc.locked, holder.locked),
        weightRatio: decimalSum(acc.weightRatio, holder.weightRatio),
      }),
      { weight: decimal(0)!, locked: decimal(0)!, weightRatio: decimal(0)! },
    )
    const othersVeCrv = decimalMinus(veCrvData.totalVeCrv, totalValues.weight)
    const otherLockedCrv = decimalMinus(veCrvData.totalLockedCrv, totalValues.locked)
    const othersWeightRatio = decimal((100 - +totalValues.weightRatio).toFixed(2))!

    return [
      ...topHolders,
      {
        user: 'Others(<0.3%)',
        weight: othersVeCrv,
        locked: otherLockedCrv,
        weightRatio: othersWeightRatio,
        unlockTime: null,
      },
    ]
  }, [veCrvData, veCrvHolders])

  return (
    <MuiBox sx={{ backgroundColor: t => t.design.Layer[1].Fill }}>
      <TitleRow>
        <BoxTitle>{t`veCRV Holder Distribution`}</BoxTitle>
        <Box flex flexGap="var(--spacing-1)">
          <SelectSortingMethod
            selectedKey={topHoldersSortBy}
            minWidth="9rem"
            items={TOP_HOLDERS_FILTERS}
            onSelectionChange={key => key != null && setTopHoldersSortBy(key as TopHoldersSortBy)}
          />
        </Box>
      </TitleRow>
      <Content>
        <ChartStateWrapper
          height={CHART_HEIGHT}
          isLoading={isLoading}
          isEmpty={!isLoading && !chartError && chartData.length === 0}
          error={chartError}
          errorMessage={t`Unable to fetch veCRV holders data.`}
          refreshData={() => Promise.all([refetchHolders(), refetchStats()])}
        >
          <TopHoldersBarChartComponent data={chartData} filter={topHoldersSortBy} />
        </ChartStateWrapper>
      </Content>
    </MuiBox>
  )
}

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
