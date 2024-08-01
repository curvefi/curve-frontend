import type { SearchParams, TableLabel, TableLabelsMapper } from '@/components/PageMarketList/types'

import React, { useMemo } from 'react'
import styled from 'styled-components'

import useStore from '@/store/useStore'

import TableSortSelect from 'ui/src/TableSort/TableSortSelect'
import TableSortSelectMobile from 'ui/src/TableSort/TableSortSelectMobile'

const SelectFilterType = ({
  showBorrowSignerCell,
  showSupplySignerCell,
  searchParams,
  tableLabels,
  tableLabelsMapper,
  updatePath,
}: {
  showBorrowSignerCell: boolean
  showSupplySignerCell: boolean
  searchParams: SearchParams
  tableLabels: TableLabel[]
  tableLabelsMapper: TableLabelsMapper
  updatePath: (updatedSearchParams: Partial<SearchParams>) => void
}) => {
  const { filterTypeKey, sortBy, sortByOrder } = searchParams

  const isXSmDown = useStore((state) => state.layout.isXSmDown)

  const sortSelectMapper = useMemo(() => {
    return tableLabels.reduce((prev, { sortIdKey }) => {
      if (filterTypeKey === 'borrow' && !showBorrowSignerCell && sortIdKey.startsWith('my')) return prev
      if (filterTypeKey === 'supply' && !showSupplySignerCell && sortIdKey.startsWith('my')) return prev
      if (!tableLabelsMapper[sortIdKey]?.name) return prev
      prev[sortIdKey] = tableLabelsMapper[sortIdKey]

      return prev
    }, {} as { [label: string]: { name: string } })
  }, [filterTypeKey, showBorrowSignerCell, showSupplySignerCell, tableLabels, tableLabelsMapper])

  // only show close button  settings is not on default
  const onSelectDeleteFn = useMemo(() => {
    if (sortBy === '' && sortByOrder === 'desc') return {}
    return { onSelectionDelete: () => updatePath({ sortBy: '', sortByOrder: 'desc' }) }
  }, [sortBy, sortByOrder, updatePath])

  return !isXSmDown ? (
    <TableSortSelect
      searchParams={searchParams}
      labelsMapper={sortSelectMapper}
      updatePath={updatePath}
      {...onSelectDeleteFn}
    />
  ) : (
    <StyledTableSortSelectMobile searchParams={searchParams} labelsMapper={sortSelectMapper} updatePath={updatePath} />
  )
}

const StyledTableSortSelectMobile = styled(TableSortSelectMobile)`
  height: 100%;

  > button {
    height: 100%;
    font-size: var(--font-size-2);
  }
`

export default SelectFilterType
