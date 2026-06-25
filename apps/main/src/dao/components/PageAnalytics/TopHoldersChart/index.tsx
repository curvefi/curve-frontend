import { useMemo, useState } from 'react'
import { styled } from 'styled-components'
import { DAO_COMPACT_CHART_HEIGHT } from '@/dao/components/Charts/constants'
import { TOP_HOLDERS_FILTERS } from '@/dao/components/PageAnalytics/constants'
import { TopHoldersBarChart as TopHoldersBarChartComponent } from '@/dao/components/PageAnalytics/TopHoldersChart/TopHoldersBarChartComponent'
import { useStatsVecrvQuery } from '@/dao/entities/stats-vecrv'
import { useVeCrvHoldersQuery, type VeCrvHolder } from '@/dao/entities/vecrv-holders'
import type { TopHoldersSortBy } from '@/dao/types/dao.types'
import MuiBox from '@mui/material/Box'
import { sortBy } from '@primitives/array.utils'
import { Box } from '@ui/Box'
import { SelectSortingMethod } from '@ui/Select/SelectSortingMethod'
import { t } from '@ui-kit/lib/i18n'
import { ChartStateWrapper } from '@ui-kit/shared/ui/Chart'
import { decimalMinus, decimalSum } from '@ui-kit/utils'

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
  const [topHoldersSortBy, setTopHoldersSortBy] = useState<TopHoldersSortBy>('weightRatio')

  const chartError = holdersError ?? statsError
  const isLoading = holdersLoading || statsLoading

  const chartData: VeCrvHolder[] | undefined = useMemo(() => {
    if (!veCrvHolders || !veCrvData) return undefined

    const topHolders = sortBy(veCrvHolders, holder => +holder.weightRatio, 'desc')
      .slice(0, TOP_HOLDERS_LIMIT)
      .filter(holder => +holder.weightRatio > MIN_TOP_HOLDER_WEIGHT_RATIO)
    const totalValues = {
      weight: decimalSum(...topHolders.map(({ weight }) => weight)),
      locked: decimalSum(...topHolders.map(({ locked }) => locked)),
      weightRatio: decimalSum(...topHolders.map(({ weightRatio }) => weightRatio)),
    }
    const othersVeCrv = decimalMinus(veCrvData.totalVeCrv, totalValues.weight)
    const otherLockedCrv = decimalMinus(veCrvData.totalLockedCrv, totalValues.locked)
    const othersWeightRatio = decimalMinus('100', totalValues.weightRatio)

    return sortBy(
      [
        ...topHolders,
        {
          user: 'Others(<0.3%)',
          weight: othersVeCrv,
          locked: otherLockedCrv,
          weightRatio: othersWeightRatio,
          unlockTime: null,
        },
      ],
      holder => +holder[topHoldersSortBy],
      'desc',
    )
  }, [topHoldersSortBy, veCrvData, veCrvHolders])

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
          height={DAO_COMPACT_CHART_HEIGHT}
          isLoading={isLoading}
          isEmpty={chartData?.length === 0}
          error={chartError}
          errorMessage={t`Unable to fetch veCRV holders data.`}
          refreshData={() => Promise.all([refetchHolders(), refetchStats()])}
        >
          <TopHoldersBarChartComponent
            height={DAO_COMPACT_CHART_HEIGHT}
            data={chartData ?? []}
            filter={topHoldersSortBy}
          />
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
