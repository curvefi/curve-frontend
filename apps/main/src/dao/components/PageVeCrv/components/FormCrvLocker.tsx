import { FormLockCreate } from '@/dao/components/PageVeCrv/components/FormLockCreate'
import { FormLockCrv } from '@/dao/components/PageVeCrv/components/FormLockCrv'
import { FormLockDate } from '@/dao/components/PageVeCrv/components/FormLockDate'
import { FormWithdraw } from '@/dao/components/PageVeCrv/components/FormWithdraw'
import type { PageVecrv } from '@/dao/components/PageVeCrv/types'
import { t } from '@evm-ui/lib/i18n'
import { getIsLockExpired } from '@evm-ui/utils/vecrv'
import { FormTabs } from '@evm-ui/widgets/DetailPageLayout/FormTabs'

type LockerTabsParams = PageVecrv & {
  canUnlock: boolean
  hasLockedCrv: boolean
}

const LockCrvTab = (pageProps: LockerTabsParams) => <FormLockCrv {...pageProps} />
const LockDateTab = (pageProps: LockerTabsParams) => <FormLockDate {...pageProps} />
const WithdrawTab = (pageProps: LockerTabsParams) => <FormWithdraw {...pageProps} />
const CreateTab = (pageProps: LockerTabsParams) => <FormLockCreate {...pageProps} />

const menu = [
  {
    value: 'adjust_crv',
    label: t`Lock More`,
    disabled: ({ canUnlock }: LockerTabsParams) => canUnlock,
    visible: ({ canUnlock, hasLockedCrv }: LockerTabsParams) => hasLockedCrv && !canUnlock,
    component: LockCrvTab,
  },
  {
    value: 'adjust_date',
    label: t`Extend Lock`,
    disabled: ({ canUnlock }: LockerTabsParams) => canUnlock,
    visible: ({ canUnlock, hasLockedCrv }: LockerTabsParams) => hasLockedCrv && !canUnlock,
    component: LockDateTab,
  },
  {
    value: 'withdraw',
    label: t`Withdraw`,
    visible: ({ hasLockedCrv }: LockerTabsParams) => hasLockedCrv,
    component: WithdrawTab,
  },
  {
    value: 'create',
    label: t`Create Lock`,
    visible: ({ hasLockedCrv }: LockerTabsParams) => !hasLockedCrv,
    component: CreateTab,
  },
] as const

export const FormCrvLocker = (pageProps: PageVecrv) => {
  const { vecrvInfo } = pageProps
  const canUnlock = getIsLockExpired(
    vecrvInfo.lockedAmountAndUnlockTime.lockedAmount,
    vecrvInfo.lockedAmountAndUnlockTime.unlockTime,
  )

  const hasLockedCrv = +vecrvInfo.lockedAmountAndUnlockTime.lockedAmount > 0

  return <FormTabs menu={menu} params={{ ...pageProps, canUnlock, hasLockedCrv }} overflow="fullWidth" shouldWrap />
}
