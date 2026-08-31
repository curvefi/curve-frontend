import { useConnection } from 'wagmi'
import { FormLockCreate } from '@/dao/components/PageVeCrv/components/FormLockCreate'
import { FormLockCrv } from '@/dao/components/PageVeCrv/components/FormLockCrv'
import { FormLockDate } from '@/dao/components/PageVeCrv/components/FormLockDate'
import { FormWithdraw } from '@/dao/components/PageVeCrv/components/FormWithdraw'
import { useLockerLockedAmountAndUnlockTime } from '@/dao/entities/locker-vecrv-info'
import type { ChainId } from '@/dao/types/dao.types'
import { t } from '@evm-ui/lib/i18n'
import { decimalGreaterThan, ZERO } from '@evm-ui/utils'
import { getIsLockExpired } from '@evm-ui/utils/vecrv'
import { FormTabs } from '@evm-ui/widgets/DetailPageLayout/FormTabs'
import { maybe } from '@primitives/objects.utils'

type LockerTabsParams = {
  chainId: ChainId
} & {
  canUnlock: boolean
  hasLockedCrv: boolean
}

const menu = [
  {
    value: 'adjust_crv',
    label: t`Lock More`,
    disabled: ({ canUnlock }: LockerTabsParams) => canUnlock,
    visible: ({ canUnlock, hasLockedCrv }: LockerTabsParams) => hasLockedCrv && !canUnlock,
    component: FormLockCrv,
  },
  {
    value: 'adjust_date',
    label: t`Extend Lock`,
    disabled: ({ canUnlock }: LockerTabsParams) => canUnlock,
    visible: ({ canUnlock, hasLockedCrv }: LockerTabsParams) => hasLockedCrv && !canUnlock,
    component: FormLockDate,
  },
  {
    value: 'withdraw',
    label: t`Withdraw`,
    visible: ({ hasLockedCrv }: LockerTabsParams) => hasLockedCrv,
    component: FormWithdraw,
  },
  {
    value: 'create',
    label: t`Create Lock`,
    visible: ({ hasLockedCrv }: LockerTabsParams) => !hasLockedCrv,
    component: FormLockCreate,
  },
] as const

export const FormCrvLocker = (pageProps: { chainId: ChainId }) => {
  const { chainId } = pageProps
  const { address: userAddress } = useConnection()
  const lockedAmountAndUnlockTime = useLockerLockedAmountAndUnlockTime({
    chainId,
    userAddress,
  })

  return maybe(lockedAmountAndUnlockTime.data, ({ lockedAmount, unlockTime }) => (
    <FormTabs
      menu={menu}
      params={{
        ...pageProps,
        canUnlock: getIsLockExpired(lockedAmount, unlockTime),
        hasLockedCrv: decimalGreaterThan(lockedAmount, ZERO),
      }}
      overflow="fullWidth"
    />
  ))
}
