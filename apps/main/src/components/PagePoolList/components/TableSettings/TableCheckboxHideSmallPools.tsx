import type { SearchParams } from '@/components/PagePoolList/types'

import React from 'react'
import { t } from '@lingui/macro'

import networks from '@/networks'
import useStore from '@/store/useStore'

import Checkbox from '@/ui/Checkbox'

const TableCheckboxHideSmallPools = ({
  rChainId,
  searchParams,
  poolDatasCachedOrApi,
  updatePath,
}: {
  rChainId: ChainId
  searchParams: SearchParams
  poolDatasCachedOrApi: PoolData[]
  updatePath(updatedSearchParams: Partial<SearchParams>): void
}) => {
  const { showHideSmallPoolsCheckbox } = networks[rChainId]

  const poolDatas = useStore((state) => state.pools.pools[rChainId])

  if (!showHideSmallPoolsCheckbox && (!poolDatasCachedOrApi || poolDatas?.length <= 10)) return null

  return (
    <Checkbox
      isDisabled={searchParams.filterKey === 'user'}
      isSelected={searchParams.filterKey === 'user' ? false : searchParams.hideSmallPools}
      onChange={(val) => updatePath({ hideSmallPools: val })}
    >
      {t`Hide very small pools`}
    </Checkbox>
  )
}

export default TableCheckboxHideSmallPools
