import type { FilterTypeKey, FilterTypeMapper, SearchParams, TableLabel } from '@lend/components/PageMarketList/types'

import React, { useCallback } from 'react'
import styled from 'styled-components'

import TableButtonFilters from '@ui/TableButtonFilters'

const SelectFilterBorrowLend = ({
  searchParams,
  filterTypeMapper,
  tableLabelsSelector,
  updatePath,
}: {
  searchParams: SearchParams
  filterTypeMapper: FilterTypeMapper
  tableLabelsSelector: { borrow: TableLabel[]; supply: TableLabel[] }
  updatePath: (updatedSearchParams: Partial<SearchParams>) => void
}) => {
  const { filterTypeKey } = searchParams

  const updateRouteFilterKey = useCallback(
    (filterTypeKey: FilterTypeKey) => {
      const tableLabels = tableLabelsSelector[filterTypeKey]
      let updatedSearchParams: Partial<SearchParams> = { ...searchParams }
      updatedSearchParams.filterTypeKey = filterTypeKey

      // change borrow key
      switch (updatedSearchParams.sortBy) {
        case 'tokenSupply':
          updatedSearchParams.sortBy = 'tokenBorrow'
          break
        case 'tokenBorrow':
          updatedSearchParams.sortBy = 'tokenSupply'
          break
      }

      // remove sort key if not in mapper
      if (updatedSearchParams.sortBy && !tableLabels.some((l) => l.sortIdKey === updatedSearchParams.sortBy)) {
        updatedSearchParams.sortBy = ''
        updatedSearchParams.sortByOrder = 'desc'
      }

      updatePath(updatedSearchParams)
    },
    [searchParams, tableLabelsSelector, updatePath],
  )

  return (
    <StyledTableButtonFilters
      disabled={false}
      filters={filterTypeMapper}
      filterKey={filterTypeKey}
      updateRouteFilterKey={updateRouteFilterKey}
    />
  )
}

const StyledTableButtonFilters = styled(TableButtonFilters)`
  align-items: flex-start;
  flex-wrap: nowrap;

  button {
    margin-right: 0;
    min-height: 35px;
  }
`

export default SelectFilterBorrowLend
