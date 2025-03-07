import { ReactNode, useMemo } from 'react'
import styled from 'styled-components'
import TableSortSelect from 'ui/src/TableSort/TableSortSelect'
import TableSortSelectMobile from 'ui/src/TableSort/TableSortSelectMobile'
import type { SearchParams, TableLabel } from '@/lend/components/PageMarketList/types'
import useStore from '@/lend/store/useStore'
import { TitleMapper } from '@/lend/types/lend.types'

const SelectFilterType = ({
  showBorrowSignerCell,
  showSupplySignerCell,
  searchParams,
  tableLabels,
  titleMapper,
  updatePath,
}: {
  showBorrowSignerCell: boolean
  showSupplySignerCell: boolean
  searchParams: SearchParams
  tableLabels: TableLabel[]
  titleMapper: TitleMapper
  updatePath: (updatedSearchParams: Partial<SearchParams>) => void
}) => {
  const { filterTypeKey, sortBy, sortByOrder } = searchParams

  const isXSmDown = useStore((state) => state.layout.isXSmDown)

  const sortSelectMapper = useMemo(
    () =>
      tableLabels.reduce(
        (prev, { sortIdKey }) => {
          if (filterTypeKey === 'borrow' && !showBorrowSignerCell && sortIdKey.startsWith('my')) return prev
          if (filterTypeKey === 'supply' && !showSupplySignerCell && sortIdKey.startsWith('my')) return prev
          if (!titleMapper[sortIdKey]?.title) return prev

          const { title } = titleMapper[sortIdKey]

          if (!prev[sortIdKey]) {
            prev[sortIdKey] = { name: title }
          } else {
            prev[sortIdKey].name = title
          }

          return prev
        },
        {} as { [label: string]: { name: ReactNode } },
      ),
    [filterTypeKey, showBorrowSignerCell, showSupplySignerCell, tableLabels, titleMapper],
  )

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
