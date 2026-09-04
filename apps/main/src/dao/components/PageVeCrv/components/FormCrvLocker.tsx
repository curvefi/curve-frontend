import { FormLockCreate } from '@/dao/components/PageVeCrv/components/FormLockCreate'
import { FormLockCrv } from '@/dao/components/PageVeCrv/components/FormLockCrv'
import { FormLockDate } from '@/dao/components/PageVeCrv/components/FormLockDate'
import { FormWithdraw } from '@/dao/components/PageVeCrv/components/FormWithdraw'
import type { LockedAmountAndUnlockTime } from '@/dao/entities/locker-vecrv-info'
import type { ChainId } from '@/dao/types/dao.types'
import { decimalGreaterThan, ZERO } from '@evm-ui/utils'
import { getIsLockExpired } from '@evm-ui/utils/vecrv'
import { FormTabs } from '@evm-ui/widgets/DetailPageLayout/FormTabs'
import { t } from '@ui/lib/i18n'

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

export const FormCrvLocker = ({
  chainId,
  unlockTime,
  lockedAmount,
}: { chainId: ChainId } & LockedAmountAndUnlockTime) => (
  <FormTabs
    menu={menu}
    params={{
      chainId,
      lockedAmount,
      unlockTime,
      canUnlock: getIsLockExpired(lockedAmount, unlockTime),
      hasLockedCrv: decimalGreaterThan(lockedAmount, ZERO),
    }}
    overflow="fullWidth"
  />
)
