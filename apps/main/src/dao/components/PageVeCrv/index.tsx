import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import FormLockCreate from '@/dao/components/PageVeCrv/components/FormLockCreate'
import FormLockCrv from '@/dao/components/PageVeCrv/components/FormLockCrv'
import FormLockDate from '@/dao/components/PageVeCrv/components/FormLockDate'
import FormWithdraw from '@/dao/components/PageVeCrv/components/FormWithdraw'
import type { FormType, PageVecrv } from '@/dao/components/PageVeCrv/types'
import useStore from '@/dao/store/useStore'
import type { CurveApi } from '@/dao/types/dao.types'
import TabSlide, { SlideTab, SlideTabs } from '@ui/TabSlide'
import { isLoading, useConnection } from '@ui-kit/features/connect-wallet'
import { useWallet } from '@ui-kit/features/connect-wallet'
import useSlideTabState from '@ui-kit/hooks/useSlideTabState'
import { t } from '@ui-kit/lib/i18n'

const TABS: { label: string; formType: FormType }[] = [
  { label: t`Lock More`, formType: 'adjust_crv' },
  { label: t`Extend Lock`, formType: 'adjust_date' },
  { label: t`Withdraw`, formType: 'withdraw' },
]

const FormCrvLocker = (pageProps: PageVecrv) => {
  const { curve, rFormType, vecrvInfo } = pageProps
  const tabsRef = useRef<HTMLDivElement>(null)
  const [selectedTab, setSelectedTab] = useState<FormType>(rFormType ?? 'adjust_crv')

  const { connectState } = useConnection<CurveApi>()
  const isLoadingCurve = isLoading(connectState)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const setFormValues = useStore((state) => state.lockedCrv.setFormValues)
  const { selectedTabIdx, tabPositions, setSelectedTabIdx } = useSlideTabState(tabsRef, selectedTab)
  const { signerAddress } = useWallet()
  const { chainId } = curve ?? {}

  const setData = useCallback(async () => {
    setFormValues(curve, isLoadingCurve, selectedTab, {}, vecrvInfo, true)
  }, [curve, isLoadingCurve, vecrvInfo, selectedTab, setFormValues])

  useEffect(() => {
    if (selectedTab === 'adjust_crv') {
      setSelectedTabIdx(0)
    } else if (selectedTab === 'adjust_date') {
      setSelectedTabIdx(1)
    } else if (selectedTab === 'withdraw') {
      setSelectedTabIdx(2)
    }
  }, [selectedTab, setSelectedTabIdx])

  const handleTabClick = (formType: FormType, idx: number) => {
    setSelectedTab(formType)
    setSelectedTabIdx(idx)
  }

  useEffect(() => {
    // if user has no locked crv, and is not on the create tab, set the tab to create
    if (+vecrvInfo.lockedAmountAndUnlockTime.lockedAmount === 0 && selectedTab !== 'create') {
      setSelectedTab('create')
    }
    // if user has locked crv, and is on the create tab, set the tab to adjust_crv
    if (+vecrvInfo.lockedAmountAndUnlockTime.lockedAmount > 0 && selectedTab === 'create') {
      setSelectedTab('adjust_crv')
    }
  }, [selectedTab, vecrvInfo])

  // fetch locked crv data
  useEffect(() => {
    void setData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, signerAddress, isPageVisible])

  return selectedTab === 'adjust_crv' || selectedTab === 'adjust_date' || selectedTab === 'withdraw' ? (
    <>
      <StyledTabSlide activeIdx={selectedTabIdx}>
        <SlideTabs ref={tabsRef}>
          {TABS.map(({ formType, label }, idx) => (
            <SlideTab
              key={label}
              tabLeft={tabPositions[idx]?.left}
              tabWidth={tabPositions[idx]?.width}
              tabTop={tabPositions[idx]?.top}
              onChange={() => handleTabClick(formType, idx)}
              tabIdx={idx}
              label={label}
            />
          ))}
        </SlideTabs>
      </StyledTabSlide>

      {selectedTab === 'adjust_crv' && <FormLockCrv {...pageProps} rFormType={selectedTab} />}
      {selectedTab === 'adjust_date' && <FormLockDate {...pageProps} rFormType={selectedTab} />}
      {selectedTab === 'withdraw' && <FormWithdraw {...pageProps} rFormType={selectedTab} />}
    </>
  ) : (
    <FormLockCreate {...pageProps} />
  )
}

export const StyledTabSlide = styled(TabSlide)`
  margin-bottom: var(--spacing-2);
`

export default FormCrvLocker
