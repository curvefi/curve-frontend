import { useEffect, useEffectEvent, useState } from 'react'
import { FormLockCreate } from '@/dao/components/PageVeCrv/components/FormLockCreate'
import { FormLockCrv } from '@/dao/components/PageVeCrv/components/FormLockCrv'
import { FormLockDate } from '@/dao/components/PageVeCrv/components/FormLockDate'
import { FormWithdraw } from '@/dao/components/PageVeCrv/components/FormWithdraw'
import type { FormType, PageVecrv } from '@/dao/components/PageVeCrv/types'
import { useStore } from '@/dao/store/useStore'
import Stack from '@mui/material/Stack'
import { isLoading, useCurve } from '@ui-kit/features/connect-wallet'
import { useLayoutStore } from '@ui-kit/features/layout'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher, type TabOption } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { getIsLockExpired } from '@ui-kit/utils/vecrv'

const { Spacing } = SizesAndSpaces

export const FormCrvLocker = (pageProps: PageVecrv) => {
  const { curve, rFormType, vecrvInfo } = pageProps

  const { connectState } = useCurve()
  const isLoadingCurve = isLoading(connectState)
  const isPageVisible = useLayoutStore((state) => state.isPageVisible)
  const setFormValues = useStore((state) => state.lockedCrv.setFormValues)
  const signerAddress = curve?.signerAddress
  const { chainId } = curve ?? {}
  const canUnlock = getIsLockExpired(
    vecrvInfo.lockedAmountAndUnlockTime.lockedAmount,
    vecrvInfo.lockedAmountAndUnlockTime.unlockTime,
  )

  const tabs: TabOption<FormType>[] = [
    { value: 'adjust_crv', label: t`Lock More`, disabled: canUnlock },
    { value: 'adjust_date', label: t`Extend Lock`, disabled: canUnlock },
    { value: 'withdraw', label: t`Withdraw` },
  ]
  const [tab, setTab] = useState<FormType>(rFormType ?? 'adjust_crv')

  const setData = useEffectEvent(() => setFormValues(curve, isLoadingCurve, tab, {}, vecrvInfo, true))

  useEffect(() => {
    if (canUnlock) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTab('withdraw')
    }
    // if user has no locked crv, and is not on the create tab, set the tab to create
    if (+vecrvInfo.lockedAmountAndUnlockTime.lockedAmount === 0 && tab !== 'create') {
      setTab('create')
    }
    // if user has locked crv, and is on the create tab, set the tab to adjust_crv
    if (+vecrvInfo.lockedAmountAndUnlockTime.lockedAmount > 0 && tab === 'create') {
      setTab('adjust_crv')
    }
  }, [tab, vecrvInfo, canUnlock])

  // fetch locked crv data
  useEffect(() => {
    setData()
  }, [chainId, signerAddress, isPageVisible])

  return tab === 'adjust_crv' || tab === 'adjust_date' || tab === 'withdraw' ? (
    <>
      <TabsSwitcher variant="underlined" value={tab} onChange={setTab} options={tabs} overflow="fullWidth" />

      <Stack gap={Spacing.md} padding={Spacing.md} paddingBlockStart={Spacing.xs}>
        {tab === 'adjust_crv' && <FormLockCrv {...pageProps} rFormType={tab} />}
        {tab === 'adjust_date' && <FormLockDate {...pageProps} rFormType={tab} />}
        {tab === 'withdraw' && <FormWithdraw {...pageProps} rFormType={tab} />}
      </Stack>
    </>
  ) : (
    <Stack gap={Spacing.md} padding={Spacing.md}>
      <FormLockCreate {...pageProps} />
    </Stack>
  )
}
