import { useCallback, useState } from 'react'
import { styled } from 'styled-components'
import { DAO_COMPACT_CHART_HEIGHT } from '@/dao/components/Charts/constants'
import { TOP_HOLDERS_FILTERS } from '@/dao/components/PageAnalytics/constants'
import { TopHoldersBarChart as TopHoldersBarChartComponent } from '@/dao/components/PageAnalytics/TopHoldersChart/TopHoldersBarChartComponent'
import { useStatsVecrvQuery, type VeCrvStats } from '@/dao/entities/stats-vecrv'
import { useVeCrvHoldersQuery, type VeCrvHolder } from '@/dao/entities/vecrv-holders'
import type { TopHoldersSortBy } from '@/dao/types/dao.types'
import { EvmChartStateWrapper } from '@evm-ui/shared/ui/EvmChartStateWrapper'
import { Box } from '@legacy-ui/Box'
import { SelectSortingMethod } from '@legacy-ui/Select/SelectSortingMethod'
import MuiBox from '@mui/material/Box'
import { sortBy } from '@primitives/array.utils'
import { useCombinedQueries } from '@ui/features/queries/combine'
import { decimalMinus, decimalSum } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'

const TOP_HOLDERS_LIMIT = 100
const MIN_TOP_HOLDER_WEIGHT_RATIO = 0.3

const toTopHolderRows = (
  veCrvHolders: VeCrvHolder[],
  veCrvData: VeCrvStats,
  topHoldersSortBy: TopHoldersSortBy,
): VeCrvHolder[] => {
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
}

export const TopLockers = () => {
  const stats = useStatsVecrvQuery({})
  const holders = useVeCrvHoldersQuery({})
  const [topHoldersSortBy, setTopHoldersSortBy] = useState<TopHoldersSortBy>('weightRatio')

  const rows = useCombinedQueries(
    [holders, stats],
    useCallback(
      (veCrvHolders: VeCrvHolder[], veCrvData: VeCrvStats) =>
        toTopHolderRows(veCrvHolders, veCrvData, topHoldersSortBy),
      [topHoldersSortBy],
    ),
  )

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
        <EvmChartStateWrapper
          query={rows}
          height={DAO_COMPACT_CHART_HEIGHT}
          isEmpty={rows.data?.length === 0}
          errorState={{
            description: t`Unable to fetch veCRV holders data.`,
            onReload: () => Promise.all([holders.refetch(), stats.refetch()]),
          }}
        >
          {data => (
            <TopHoldersBarChartComponent height={DAO_COMPACT_CHART_HEIGHT} data={data} filter={topHoldersSortBy} />
          )}
        </EvmChartStateWrapper>
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
