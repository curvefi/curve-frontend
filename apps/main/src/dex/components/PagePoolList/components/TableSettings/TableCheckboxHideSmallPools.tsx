import type { SearchParams } from '@/dex/components/PagePoolList/types'

import React from 'react'
import { t } from '@ui-kit/lib/i18n'

import Checkbox from '@ui/Checkbox'
import { PoolData } from '@/dex/types/main.types'

const TableCheckboxHideSmallPools = ({
  searchParams,
  poolDatasCachedOrApi,
  updatePath,
}: {
  searchParams: SearchParams
  poolDatasCachedOrApi: PoolData[]
  updatePath(updatedSearchParams: Partial<SearchParams>): void
}) => {
  const isDisabled = searchParams.filterKey === 'user' || poolDatasCachedOrApi.length < 10
  return (
    <Checkbox
      isDisabled={isDisabled}
      isSelected={isDisabled ? false : searchParams.hideSmallPools}
      onChange={(val) => updatePath({ hideSmallPools: val })}
    >
      {t`Hide very small pools`}
    </Checkbox>
  )
}

export default TableCheckboxHideSmallPools
