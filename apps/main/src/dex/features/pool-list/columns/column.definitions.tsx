import { useMemo } from 'react'
import { useAprToApy } from '@evm-ui/hooks/useAprToApy'
import { createAppColumnHelper } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { AgeCell } from '../cells/AgeCell'
import { BaseRateCell, WeeklyBaseRateCell } from '../cells/BaseRateCell'
import { CrvRateCell } from '../cells/CrvRateCell'
import { NetRateCell } from '../cells/NetRateCell'
import { PointsCell } from '../cells/PointsCell'
import { PoolTitleCell } from '../cells/PoolTitleCell'
import { RewardsRateCell } from '../cells/RewardsRateCell'
import { TokensCell } from '../cells/TokensCell'
import { UsdCell } from '../cells/UsdCell'
import { getBaseRate, getCrvRateRange, getNetRate, getRewardsRate } from '../cells/utils'
import { AgeHeaderTooltipContent } from '../header-tooltips/AgeHeaderTooltipContent'
import { BaseRateHeaderTooltipContent } from '../header-tooltips/BaseRateHeaderTooltipContent'
import { CrvRateHeaderTooltipContent } from '../header-tooltips/CrvRateHeaderTooltipContent'
import { NetRateHeaderTooltipContent } from '../header-tooltips/NetRateHeaderTooltipContent'
import { PointsHeaderTooltipContent } from '../header-tooltips/PointsHeaderTooltipContent'
import { PoolHeaderTooltipContent } from '../header-tooltips/PoolHeaderTooltipContent'
import { RewardsRateHeaderTooltipContent } from '../header-tooltips/RewardsRateHeaderTooltipContent'
import { TokensHeaderTooltipContent } from '../header-tooltips/TokensHeaderTooltipContent'
import { TvlHeaderTooltipContent } from '../header-tooltips/TvlHeaderTooltipContent'
import { VolumeHeaderTooltipContent } from '../header-tooltips/VolumeHeaderTooltipContent'
import type { PoolRow } from '../types'
import { usePoolTitles } from './column.titles'
import { PoolColumnId } from './columns.enum'

const columnHelper = createAppColumnHelper<PoolRow>()

export const usePoolColumns = () => {
  const convertAprToApy = useAprToApy()
  const poolTitles = usePoolTitles()

  return useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor('name', {
          id: PoolColumnId.PoolName,
          header: poolTitles[PoolColumnId.PoolName],
          cell: PoolTitleCell,
          meta: {
            tooltip: { title: poolTitles[PoolColumnId.PoolName], body: <PoolHeaderTooltipContent /> },
          },
        }),
        columnHelper.accessor(pool => getNetRate(pool, convertAprToApy), {
          id: PoolColumnId.NetRate,
          header: poolTitles[PoolColumnId.NetRate],
          cell: ({ row }) => <NetRateCell pool={row.original} />,
          meta: {
            type: 'numeric',
            tooltip: { title: poolTitles[PoolColumnId.NetRate], body: <NetRateHeaderTooltipContent /> },
          },
        }),
        columnHelper.accessor(pool => getBaseRate(pool, 'daily', convertAprToApy), {
          id: PoolColumnId.BaseRate,
          header: poolTitles[PoolColumnId.BaseRate],
          cell: BaseRateCell,
          meta: {
            type: 'numeric',
            tooltip: { title: poolTitles[PoolColumnId.BaseRate], body: <BaseRateHeaderTooltipContent /> },
          },
          sortUndefined: 'last',
        }),
        columnHelper.accessor(pool => getBaseRate(pool, 'weekly', convertAprToApy), {
          id: PoolColumnId.WeeklyBaseRate,
          header: poolTitles[PoolColumnId.WeeklyBaseRate],
          cell: WeeklyBaseRateCell,
          meta: {
            type: 'numeric',
            tooltip: {
              title: poolTitles[PoolColumnId.WeeklyBaseRate],
              body: <BaseRateHeaderTooltipContent weekly />,
            },
          },
          sortUndefined: 'last',
        }),
        columnHelper.accessor(
          pool => (pool.gauge?.isKilled ? undefined : getCrvRateRange(pool, convertAprToApy)?.unboostedRate),
          {
            id: PoolColumnId.CrvRate,
            header: poolTitles[PoolColumnId.CrvRate],
            cell: ({ row }) => <CrvRateCell pool={row.original} />,
            meta: {
              type: 'numeric',
              tooltip: { title: poolTitles[PoolColumnId.CrvRate], body: <CrvRateHeaderTooltipContent /> },
            },
            sortUndefined: 'last',
          },
        ),
        columnHelper.accessor(pool => getRewardsRate(pool, convertAprToApy), {
          id: PoolColumnId.RewardsRate,
          header: poolTitles[PoolColumnId.RewardsRate],
          cell: ({ row }) => <RewardsRateCell pool={row.original} />,
          meta: {
            type: 'numeric',
            tooltip: { title: poolTitles[PoolColumnId.RewardsRate], body: <RewardsRateHeaderTooltipContent /> },
          },
        }),
        columnHelper.display({
          id: PoolColumnId.Points,
          header: poolTitles[PoolColumnId.Points],
          cell: ({ row }) => <PointsCell pool={row.original} />,
          enableSorting: false,
          meta: {
            type: 'numeric',
            tooltip: { title: poolTitles[PoolColumnId.Points], body: <PointsHeaderTooltipContent /> },
          },
        }),
        columnHelper.display({
          id: PoolColumnId.Tokens,
          header: poolTitles[PoolColumnId.Tokens],
          cell: ({ row }) => <TokensCell pool={row.original} />,
          enableSorting: false,
          meta: {
            type: 'numeric',
            tooltip: { title: poolTitles[PoolColumnId.Tokens], body: <TokensHeaderTooltipContent /> },
          },
        }),
        columnHelper.accessor('tradingVolume24h', {
          id: PoolColumnId.Volume,
          header: poolTitles[PoolColumnId.Volume],
          cell: UsdCell,
          meta: {
            type: 'numeric',
            tooltip: { title: poolTitles[PoolColumnId.Volume], body: <VolumeHeaderTooltipContent /> },
          },
          sortUndefined: 'last',
        }),
        columnHelper.accessor('tvlUsd', {
          id: PoolColumnId.Tvl,
          header: poolTitles[PoolColumnId.Tvl],
          cell: UsdCell,
          meta: {
            type: 'numeric',
            tooltip: { title: poolTitles[PoolColumnId.Tvl], body: <TvlHeaderTooltipContent /> },
          },
          sortUndefined: 'last',
        }),
        columnHelper.accessor('creationDate', {
          id: PoolColumnId.Age,
          header: poolTitles[PoolColumnId.Age],
          cell: AgeCell,
          meta: {
            type: 'numeric',
            tooltip: { title: poolTitles[PoolColumnId.Age], body: <AgeHeaderTooltipContent /> },
          },
          sortUndefined: 'last',
        }),
      ]),
    [convertAprToApy, poolTitles],
  )
}
