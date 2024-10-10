import type { SearchParams } from '@/components/PageMarketList/types'

import React, { useMemo } from 'react'

import useStore from '@/store/useStore'

import TrNoResult, { TrNoResultProps } from '@/ui/Table/TrNoResult'
import { Td, Tr } from '@/ui/Table'

const TableRowNoResult = ({
  colSpan,
  updatePath,
}: {
  colSpan: number
  updatePath: (updatedSearchParams: Partial<SearchParams>) => void
}) => {
  const searchParams = useStore((state) => state.collateralList.searchParams)
  const { searchText } = searchParams

  const props = useMemo<Pick<TrNoResultProps, 'noResultKey' | 'value' | 'action'>>(() => {
    if (searchText) return { noResultKey: 'search', value: searchText, action: () => updatePath({ searchText: '' }) }
    return { noResultKey: '', value: '' }
  }, [searchText, updatePath])

  return (
    <Tr>
      <Td colSpan={colSpan}>
        <TrNoResult type="market" {...props} />
      </Td>
    </Tr>
  )
}

export default TableRowNoResult
