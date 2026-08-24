import { useEffect, useEffectEvent } from 'react'
import { FormLockCreate } from '@/dao/components/PageVeCrv/components/FormLockCreate'
import { FormLockCrv } from '@/dao/components/PageVeCrv/components/FormLockCrv'
import { FormLockDate } from '@/dao/components/PageVeCrv/components/FormLockDate'
import { FormWithdraw } from '@/dao/components/PageVeCrv/components/FormWithdraw'
import type { FormType, PageVecrv } from '@/dao/components/PageVeCrv/types'
import { useStore } from '@/dao/store/useStore'
import { isLoading, useCurve } from '@evm-ui/features/connect-wallet'
import { useLayoutStore } from '@evm-ui/features/layout'
import { type TabItem, useTabs } from '@evm-ui/hooks/useTabs'
import { t } from '@evm-ui/lib/i18n'
import { TabsSwitcher } from '@evm-ui/shared/ui/Tabs/TabsSwitcher'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { getIsLockExpired } from '@evm-ui/utils/vecrv'
import Stack from '@mui/material/Stack'

const { Spacing } = SizesAndSpaces
type LockerTabsParams = PageVecrv & {
  canUnlock: boolean
  hasLockedCrv: boolean
}

const LockCrvTab = (pageProps: LockerTabsParams) => <FormLockCrv {...pageProps} rFormType="adjust_crv" />
const LockDateTab = (pageProps: LockerTabsParams) => <FormLockDate {...pageProps} rFormType="adjust_date" />
const WithdrawTab = (pageProps: LockerTabsParams) => <FormWithdraw {...pageProps} rFormType="withdraw" />
const CreateTab = (pageProps: LockerTabsParams) => <FormLockCreate {...pageProps} />

const menu: TabItem<FormType, LockerTabsParams>[] = [
  {
    value: 'adjust_crv',
    label: t`Lock More`,
    disabled: ({ canUnlock }) => canUnlock,
    visible: ({ canUnlock, hasLockedCrv }) => hasLockedCrv && !canUnlock,
    component: LockCrvTab,
  },
  {
    value: 'adjust_date',
    label: t`Extend Lock`,
    disabled: ({ canUnlock }) => canUnlock,
    visible: ({ canUnlock, hasLockedCrv }) => hasLockedCrv && !canUnlock,
    component: LockDateTab,
  },
  { value: 'withdraw', label: t`Withdraw`, visible: ({ hasLockedCrv }) => hasLockedCrv, component: WithdrawTab },
  { value: 'create', label: t`Create Lock`, visible: ({ hasLockedCrv }) => !hasLockedCrv, component: CreateTab },
]

export const FormCrvLocker = (pageProps: PageVecrv) => {
  const { curve, rFormType, vecrvInfo } = pageProps

  const { connectState } = useCurve()
  const isLoadingCurve = isLoading(connectState)
  const isPageVisible = useLayoutStore(state => state.isPageVisible)
  const setFormValues = useStore(state => state.lockedCrv.setFormValues)
  const signerAddress = curve?.signerAddress
  const { chainId } = curve ?? {}
  const canUnlock = getIsLockExpired(
    vecrvInfo.lockedAmountAndUnlockTime.lockedAmount,
    vecrvInfo.lockedAmountAndUnlockTime.unlockTime,
  )

  const hasLockedCrv = +vecrvInfo.lockedAmountAndUnlockTime.lockedAmount > 0

  const onChange = (value: FormType) => setFormValues(curve, isLoadingCurve, value, {}, vecrvInfo, true)
  const formTabs = useTabs({
    menu,
    params: { ...pageProps, canUnlock, hasLockedCrv },
    defaultValue: rFormType,
    onChange,
  })
  const refreshFormValues = useEffectEvent(() => onChange(formTabs.tab.value))

  // fetch locked crv data
  useEffect(() => refreshFormValues(), [chainId, signerAddress, isPageVisible])

  const showTabs = formTabs.tabs.length > 1

  return (
    <>
      {showTabs && (
        <TabsSwitcher
          variant="underlined"
          value={formTabs.tab.value}
          onChange={formTabs.onChange}
          options={formTabs.tabs}
          overflow="fullWidth"
        />
      )}
      <Stack sx={{ gap: Spacing.md, padding: Spacing.md, paddingBlockStart: Spacing.xs }}>{formTabs.content}</Stack>
    </>
  )
}
