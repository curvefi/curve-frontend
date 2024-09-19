import type { FormType } from '@/components/PagePool/contextPool'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { t } from '@lingui/macro'

import { isValidAddress } from '@/utils'
import { usePoolContext } from '@/components/PagePool/contextPool'

import { SlideTabs, SlideTab } from '@/ui/TabSlide'
import { StyledTabSlide } from '@/components/PagePool/styles'
import FormClaim from '@/components/PagePool/Claim'
import FormWithdraw from '@/components/PagePool/Withdraw/components/FormWithdraw'
import FormUnstake from '@/components/PagePool/Withdraw/components/FormUnstake'

const Withdraw: React.FC = () => {
  const tabsRef = useRef<HTMLDivElement>(null)

  const { formType, signerAddress, poolDataCacheOrApi, setFormType } = usePoolContext()

  const [tabPositions, setTabPositions] = useState<{ left: number; width: number; top: number }[]>([])
  const [selectedTabIdx, setSelectedTabIdx] = useState(0)

  const TABS: { label: string; formType: FormType }[] = useMemo(
    () => [
      { label: t`Withdraw`, formType: 'WITHDRAW' },
      { label: t`Unstake`, formType: 'UNSTAKE' },
      { label: t`Claim Rewards`, formType: 'CLAIM' },
    ],
    []
  )

  // tabs positions
  useEffect(() => {
    if (!tabsRef.current) return

    const tabsNode = tabsRef.current
    const tabsDOMRect = tabsNode.getBoundingClientRect()
    const updatedTabPositions = Array.from(tabsNode.childNodes as NodeListOf<HTMLInputElement>)
      .filter((n) => n.classList.contains('tab'))
      .map((n, idx) => {
        const domRect = n.getBoundingClientRect()
        const left = idx == 0 ? 0 : domRect.left - tabsDOMRect.left
        const top = domRect.bottom - tabsDOMRect.top
        return { left, width: domRect.width, top }
      })

    setTabPositions(updatedTabPositions)
  }, [selectedTabIdx])

  const handleTabChange = useCallback(
    (idx: number) => {
      setFormType(TABS[idx].formType)
      setSelectedTabIdx(idx)
    },
    [TABS, setFormType]
  )

  useEffect(() => {
    handleTabChange(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {(isValidAddress(poolDataCacheOrApi.pool.gauge.address) || poolDataCacheOrApi.gauge.isKilled) && (
        <StyledTabSlide activeIdx={selectedTabIdx}>
          <SlideTabs ref={tabsRef}>
            {TABS.map(({ label, formType }, idx) => {
              if (formType.startsWith('CLAIM') && !signerAddress) return null

              return (
                <SlideTab
                  key={label}
                  tabLeft={tabPositions[idx]?.left}
                  tabWidth={tabPositions[idx]?.width}
                  tabTop={tabPositions[idx]?.top}
                  onChange={() => handleTabChange(idx)}
                  tabIdx={idx}
                  label={label}
                />
              )
            })}
          </SlideTabs>
        </StyledTabSlide>
      )}

      {formType === 'WITHDRAW' && <FormWithdraw />}
      {formType === 'UNSTAKE' && <FormUnstake />}
      {formType.startsWith('CLAIM') && <FormClaim />}
    </>
  )
}

export default Withdraw
