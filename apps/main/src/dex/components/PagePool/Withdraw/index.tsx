import type { FormType } from '@/dex/components/PagePool/Withdraw/types'
import type { TransferProps } from '@/dex/components/PagePool/types'

import { t } from '@ui-kit/lib/i18n'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { isValidAddress } from '@/dex/utils'
import useStore from '@/dex/store/useStore'

import { SlideTabs, SlideTab } from '@ui/TabSlide'
import { StyledTabSlide } from '@/dex/components/PagePool/styles'
import FormClaim from '@/dex/components/PagePool/Withdraw/components/FormClaim'
import FormWithdraw from '@/dex/components/PagePool/Withdraw/components/FormWithdraw'
import FormUnstake from '@/dex/components/PagePool/Withdraw/components/FormUnstake'

const Withdraw = (transferProps: TransferProps) => {
  const tabsRef = useRef<HTMLDivElement>(null)

  const { curve, poolData, poolDataCacheOrApi } = transferProps
  const { signerAddress } = curve ?? {}

  const formType = useStore((state) => state.poolWithdraw.formType)
  const resetState = useStore((state) => state.poolWithdraw.resetState)
  const setStateByKey = useStore((state) => state.poolWithdraw.setStateByKey)

  const [tabPositions, setTabPositions] = useState<{ left: number; width: number; top: number }[]>([])
  const [selectedTabIdx, setSelectedTabIdx] = useState(0)

  const TABS: { label: string; formType: FormType }[] = useMemo(
    () => [
      { label: t`Withdraw`, formType: 'WITHDRAW' },
      { label: t`Unstake`, formType: 'UNSTAKE' },
      { label: t`Claim Rewards`, formType: 'CLAIM' },
    ],
    [],
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
      setStateByKey('formType', TABS[idx].formType)
      setSelectedTabIdx(idx)
    },
    [TABS, setStateByKey],
  )

  useEffect(() => {
    if (poolData) {
      handleTabChange(0)
      resetState(poolData, 'WITHDRAW')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolData?.pool?.id])

  return (
    <>
      {(isValidAddress(poolDataCacheOrApi.pool.gauge.address) || poolDataCacheOrApi.gauge.isKilled) && (
        <StyledTabSlide activeIdx={selectedTabIdx}>
          <SlideTabs ref={tabsRef}>
            {TABS.map(({ label, formType }, idx) => {
              if (formType === 'CLAIM' && !signerAddress) return null

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

      {formType === 'WITHDRAW' ? (
        <FormWithdraw {...transferProps} />
      ) : formType === 'UNSTAKE' ? (
        <FormUnstake {...transferProps} />
      ) : formType === 'CLAIM' ? (
        <FormClaim {...transferProps} />
      ) : null}
    </>
  )
}

export default Withdraw
