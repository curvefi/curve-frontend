import { PoolData } from '@/dex/types/main.types'
import { Checkbox } from '@ui/Checkbox'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { t } from '@ui-kit/lib/i18n'

export const TableCheckboxHideSmallPools = ({ poolDatasCachedOrApi }: { poolDatasCachedOrApi: PoolData[] }) => {
  const isDisabled = poolDatasCachedOrApi.length < 10

  const hideSmallPools = useUserProfileStore((state) => state.hideSmallPools)
  const setHideSmallPools = useUserProfileStore((state) => state.setHideSmallPools)

  return (
    <Checkbox
      isDisabled={isDisabled}
      isSelected={isDisabled ? false : hideSmallPools}
      onChange={(val) => setHideSmallPools(val)}
    >
      {t`Hide very small pools`}
    </Checkbox>
  )
}
