import { FormLockCreate } from '@/dao/components/PageVeCrv/components/FormLockCreate'
import { FormLockCrv } from '@/dao/components/PageVeCrv/components/FormLockCrv'
import { FormLockDate } from '@/dao/components/PageVeCrv/components/FormLockDate'
import { FormWithdraw } from '@/dao/components/PageVeCrv/components/FormWithdraw'
import type { PageVecrv } from '@/dao/components/PageVeCrv/types'
import { t } from '@evm-ui/lib/i18n'
import { decimal, decimalGreaterThan, ZERO } from '@evm-ui/utils'
import { getIsLockExpired } from '@evm-ui/utils/vecrv'
import { FormTabs } from '@evm-ui/widgets/DetailPageLayout/FormTabs'

type LockerTabsParams = PageVecrv & {
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

export const FormCrvLocker = (pageProps: PageVecrv) => {
  const { vecrvInfo } = pageProps
  const canUnlock = getIsLockExpired(
    vecrvInfo.lockedAmountAndUnlockTime.lockedAmount,
    vecrvInfo.lockedAmountAndUnlockTime.unlockTime,
  )

  const hasLockedCrv = decimalGreaterThan(decimal(vecrvInfo.lockedAmountAndUnlockTime.lockedAmount) ?? ZERO, ZERO)

  return <FormTabs menu={menu} params={{ ...pageProps, canUnlock, hasLockedCrv }} overflow="fullWidth" />
}
