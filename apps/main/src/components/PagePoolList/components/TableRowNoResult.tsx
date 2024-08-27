import type { SearchParams } from '@/components/PagePoolList/types'

import { useMemo } from 'react'
import useStore from '@/store/useStore'

import { shortenAccount } from '@/ui/utils'

import TrNoResult, { TrNoResultProps } from '@/ui/Table/TrNoResult'
import { Td, Tr } from '@/ui/Table'

type Props = {
  colSpan: number
  searchParams: SearchParams
  signerAddress: string
  updatePath(searchParams: Partial<SearchParams>): void
}

const TableRowNoResult = ({ colSpan, searchParams, signerAddress, updatePath }: Props) => {
  const { filterKey, searchText } = searchParams

  const userPoolListLoaded = useStore((state) => state.user.poolListLoaded)
  const userPoolListError = useStore((state) => state.user.poolListError)

  const props = useMemo<Pick<TrNoResultProps, 'noResultKey' | 'value' | 'action'>>(() => {
    if (searchText) return { noResultKey: 'search', value: searchText, action: () => updatePath({ searchText: '' }) }
    if (filterKey === 'user')
      return {
        noResultKey: 'filter',
        value: shortenAccount(signerAddress),
        action: () => updatePath({ filterKey: 'all' }),
      }

    if (filterKey) return { noResultKey: 'filter', value: filterKey, action: () => updatePath({ filterKey: 'all' }) }
    if (userPoolListLoaded && userPoolListError) return { noResultKey: 'api', value: '' }
    return { noResultKey: '', value: '' }
  }, [filterKey, searchText, signerAddress, updatePath, userPoolListError, userPoolListLoaded])

  return (
    <Tr>
      <Td colSpan={colSpan}>
        <TrNoResult type="pool" {...props} />
      </Td>
    </Tr>
  )
}

export default TableRowNoResult
