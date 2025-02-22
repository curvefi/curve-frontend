import type { SearchParams } from '@/dex/components/PagePoolList/types'

import React, { useEffect } from 'react'
import { t } from '@ui-kit/lib/i18n'

import Checkbox from '@ui/Checkbox'
import { PoolData } from '@/dex/types/main.types'
import { useUserProfileStore } from '@ui-kit/features/user-profile'

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

  const hideSmallPools = useUserProfileStore((state) => state.hideSmallPools)
  const setHideSmallPools = useUserProfileStore((state) => state.setHideSmallPools)

  // If search params change, update user profile setting
  useEffect(() => {
    setHideSmallPools(searchParams.hideSmallPools)
  }, [searchParams, setHideSmallPools])

  // If user profile setting changes, update search params
  useEffect(() => {
    updatePath({ hideSmallPools })
  }, [hideSmallPools, updatePath])

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
