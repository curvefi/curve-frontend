import { ReactNode, useMemo } from 'react'
import styled from 'styled-components'
import type { SearchParams, TableLabel } from '@/loan/components/PageMarketList/types'
import { TITLE } from '@/loan/constants'
import { TitleMapper } from '@/loan/types/loan.types'
import TableSortSelect from '@ui/TableSort/TableSortSelect'
import TableSortSelectMobile from '@ui/TableSort/TableSortSelectMobile'
import { useLayoutStore } from '@ui-kit/features/layout'

const SelectFilterType = ({
  someLoanExists,
  searchParams,
  tableLabels,
  titleMapper,
  updatePath,
}: {
  someLoanExists: boolean
  searchParams: SearchParams
  tableLabels: TableLabel[]
  titleMapper: TitleMapper
  updatePath: (updatedSearchParams: Partial<SearchParams>) => void
}) => {
  const { sortBy, sortByOrder } = searchParams

  const isXSmDown = useLayoutStore((state) => state.isXSmDown)

  const sortSelectMapper = useMemo(
    () =>
      tableLabels.reduce(
        (prev, { titleKey }) => {
          if (!someLoanExists && titleKey.startsWith('my')) return prev
          if (!titleMapper[titleKey]?.title) return prev

          const { title } = titleMapper[titleKey]

          if (!prev[titleKey]) {
            prev[titleKey] = { name: title }
          } else {
            prev[titleKey].name = title
          }

          return prev
        },
        {} as { [label: string]: { name: ReactNode } },
      ),
    [someLoanExists, tableLabels, titleMapper],
  )

  // only show close button  settings is not on default
  const onSelectDeleteFn = useMemo(() => {
    if (sortBy === TITLE.totalBorrowed && sortByOrder === 'desc') return {}
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
