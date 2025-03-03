import type { FormType, PageVecrv } from '@/dex/components/PageCrvLocker/types'
import { t } from '@ui-kit/lib/i18n'
import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import useStore from '@/dex/store/useStore'
import TabSlide, { SlideTab, SlideTabs } from '@ui/TabSlide'
import FormLockCreate from '@/dex/components/PageCrvLocker/components/FormLockCreate'
import FormLockCrv from '@/dex/components/PageCrvLocker/components/FormLockCrv'
import FormLockDate from '@/dex/components/PageCrvLocker/components/FormLockDate'

const FormCrvLocker = (pageProps: PageVecrv) => {
  const { curve, rFormType, vecrvInfo, toggleForm } = pageProps
  const tabsRef = useRef<HTMLDivElement>(null)

  const isLoadingCurve = useStore((state) => state.isLoadingCurve)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const setFormValues = useStore((state) => state.lockedCrv.setFormValues)

  const [tabPositions, setTabPositions] = useState<{ left: number; width: number; top: number }[]>([])
  const [selectedTabIdx, setSelectedTabIdx] = useState<number>(0)

  const { chainId, signerAddress } = curve ?? {}

  const TABS: { label: string; formType: FormType }[] = [
    { label: t`Increase Amount`, formType: 'adjust_crv' },
    { label: t`Increase Lock`, formType: 'adjust_date' },
  ]

  // tabs positions
  useEffect(() => {
    if (!tabsRef.current || selectedTabIdx === null) return

    const tabsNode = tabsRef.current
    const tabsDOMRect = tabsNode.getBoundingClientRect()
    const updatedTabPositions = Array.from(tabsNode.childNodes as NodeListOf<HTMLInputElement>)
      .filter((n) => n.classList.contains('tab'))
      .map((n, idx) => {
        const domRect = n.getBoundingClientRect()
        const left = idx == -0 ? 0 : domRect.left - tabsDOMRect.left
        const top = domRect.bottom - tabsDOMRect.top
        return { left, width: domRect.width, top }
      })

    setTabPositions(updatedTabPositions)
  }, [selectedTabIdx])

  const setData = useCallback(async () => {
    setFormValues(curve, isLoadingCurve, rFormType, {}, vecrvInfo, true)
  }, [curve, isLoadingCurve, vecrvInfo, rFormType, setFormValues])

  useEffect(() => {
    setSelectedTabIdx(rFormType === 'adjust_crv' ? 0 : 1)
  }, [rFormType])

  // fetch locked crv data
  useEffect(() => {
    setData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, signerAddress, isPageVisible])

  return rFormType === 'adjust_crv' || rFormType === 'adjust_date' ? (
    <>
      <StyledTabSlide activeIdx={selectedTabIdx}>
        <SlideTabs ref={tabsRef}>
          {TABS.map(({ formType, label }, idx) => (
            <SlideTab
              key={label}
              tabLeft={tabPositions[idx]?.left}
              tabWidth={tabPositions[idx]?.width}
              tabTop={tabPositions[idx]?.top}
              onChange={() => toggleForm(formType)}
              tabIdx={idx}
              label={label}
            />
          ))}
        </SlideTabs>
      </StyledTabSlide>

      {rFormType === 'adjust_crv' && <FormLockCrv {...pageProps} />}
      {rFormType === 'adjust_date' && <FormLockDate {...pageProps} />}
    </>
  ) : (
    <FormLockCreate {...pageProps} />
  )
}

export const StyledTabSlide = styled(TabSlide)`
  margin-bottom: var(--spacing-2);
`

export default FormCrvLocker
