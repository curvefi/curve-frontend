import type { FormType } from '@/components/PagePool/contextPool'

import { t } from '@lingui/macro'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { isValidAddress } from '@/utils'
import { usePoolContext } from '@/components/PagePool/contextPool'
import networks from '@/networks'

import { StyledTabSlide } from '@/components/PagePool/styles'
import { SlideTab, SlideTabs } from '@/ui/TabSlide'
import AlertBox from '@/ui/AlertBox'
import AlertCompensation from '@/components/PagePool/Deposit/components/AlertCompensation'
import FormDeposit from '@/components/PagePool/Deposit/components/FormDeposit'
import FormStake from '@/components/PagePool/Deposit/components/FormStake'

type Props = {
  hasDepositAndStake: boolean
}

const Deposit: React.FC<Props> = ({ hasDepositAndStake }) => {
  const { rChainId, poolAlert, formType, poolData, poolDataCacheOrApi, setFormType } = usePoolContext()

  const tabsRef = useRef<HTMLDivElement>(null)

  const [tabPositions, setTabPositions] = useState<{ left: number; width: number; top: number }[]>([])
  const [selectedTabIdx, setSelectedTabIdx] = useState(0)

  const TABS = useMemo<{ label: string; formType: FormType }[]>(
    () =>
      [
        { label: t`Deposit`, formType: 'DEPOSIT' },
        { label: t`Stake`, formType: 'STAKE' },
        { label: t`Deposit & Stake`, formType: 'DEPOSIT_STAKE' },
      ] as const,
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
        const left = idx == -0 ? 0 : domRect.left - tabsDOMRect.left
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

  // onMount
  useEffect(() => {
    handleTabChange(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolData?.pool?.id])

  return (
    <>
      {isValidAddress(poolDataCacheOrApi.pool.gauge.address) && rChainId && (
        <StyledTabSlide activeIdx={selectedTabIdx}>
          <SlideTabs ref={tabsRef}>
            {TABS.map(({ formType, label }, idx) => {
              if (
                (formType === 'DEPOSIT_STAKE' && !hasDepositAndStake) ||
                networks[rChainId].forms.indexOf(formType) === -1
              ) {
                return <React.Fragment key={label}></React.Fragment>
              }

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

      {poolAlert && poolAlert.isDisableDeposit ? (
        <>
          <AlertCompensation />
          <AlertBox {...poolAlert}>{poolAlert.message}</AlertBox>
        </>
      ) : (
        <>
          {formType === 'DEPOSIT' && <FormDeposit formType="DEPOSIT" />}
          {formType === 'DEPOSIT_STAKE' && (
            <>
              {poolDataCacheOrApi.gauge.isKilled ? (
                <AlertBox alertType="warning">{t`Staking is disabled due to inactive Gauge.`}</AlertBox>
              ) : (
                <FormDeposit formType="DEPOSIT_STAKE" />
              )}
            </>
          )}
          {formType === 'STAKE' && (
            <>
              {poolDataCacheOrApi.gauge.isKilled ? (
                <AlertBox alertType="warning">{t`Staking is disabled due to inactive Gauge.`}</AlertBox>
              ) : (
                <FormStake />
              )}
            </>
          )}
        </>
      )}
    </>
  )
}

export default Deposit
