import type { PageMarketList } from '@/components/PageMarketList/types'

import React, { useMemo } from 'react'

import { Filter } from '@/components/PageMarketList/utils'
import useStore from '@/store/useStore'

import { shortenAccount } from '@/ui/utils'
import TrNoResult, { type TrNoResultProps } from '@/ui/Table/TrNoResult'

const MarketListNoResult = ({
  searchParams,
  signerAddress,
  updatePath,
}: Pick<PageMarketList, 'searchParams' | 'updatePath'> & { signerAddress: string | undefined }) => {
  const owmDatasError = useStore((state) => state.markets.error)

  const { searchText, filterKey } = searchParams

  const props = useMemo<Pick<TrNoResultProps, 'noResultKey' | 'value' | 'action'>>(() => {
    if (searchText) return { noResultKey: 'search', value: searchText, action: () => updatePath({ searchText: '' }) }
    if (owmDatasError) return { noResultKey: 'api', value: '' }

    if (filterKey === 'user' && !!signerAddress)
      return {
        noResultKey: 'filter',
        value: shortenAccount(signerAddress),
        action: () => updatePath({ filterKey: Filter.all }),
      }

    if (filterKey)
      return { noResultKey: 'filter', value: filterKey, action: () => updatePath({ filterKey: Filter.all }) }

    return { noResultKey: '', value: '' }
  }, [filterKey, owmDatasError, searchText, signerAddress, updatePath])

  return <TrNoResult type="market" {...props} />
}

export default MarketListNoResult
