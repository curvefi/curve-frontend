import type { FormType } from '@/components/PagePool/Deposit/types'
import type { TransferProps } from '@/components/PagePool/types'
import { t } from '@lingui/macro'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isValidAddress } from '@/utils'
import useStore from '@/store/useStore'
import { DEFAULT_FORM_STATUS } from '@/components/PagePool/Deposit/utils'
import { StyledTabSlide } from '@/components/PagePool/styles'
import { SlideTab, SlideTabs } from '@/ui/TabSlide'
import AlertBox from '@/ui/AlertBox'
import FormDeposit from '@/components/PagePool/Deposit/components/FormDeposit'
import FormDepositStake from '@/components/PagePool/Deposit/components/FormDepositStake'
import FormStake from '@/components/PagePool/Deposit/components/FormStake'

const Deposit = ({ hasDepositAndStake, ...transferProps }: TransferProps & { hasDepositAndStake: boolean }) => {
  const tabsRef = useRef<HTMLDivElement>(null)

  const { poolAlert, poolData, poolDataCacheOrApi } = transferProps
  const { rChainId } = transferProps.routerParams
  const formType = useStore((state) => state.poolDeposit.formType)
  const resetState = useStore((state) => state.poolDeposit.resetState)
  const setStateByKeys = useStore((state) => state.poolDeposit.setStateByKeys)

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
      setStateByKeys({
        formStatus: DEFAULT_FORM_STATUS,
        formType: TABS[idx].formType,
      })
      setSelectedTabIdx(idx)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setStateByKeys]
  )

  // onMount
  useEffect(() => {
    if (poolData) {
      handleTabChange(0)
      resetState(poolData, 'DEPOSIT')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolData?.pool?.id])

  return (
    <>
      {isValidAddress(poolDataCacheOrApi.pool.gauge?.address) && rChainId && (
        <StyledTabSlide activeIdx={selectedTabIdx}>
          <SlideTabs ref={tabsRef}>
            {TABS.map(({ formType, label }, idx) => {
              if (formType === 'DEPOSIT_STAKE' && !hasDepositAndStake) {
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
        <AlertBox {...poolAlert}>{poolAlert.message}</AlertBox>
      ) : (
        <>
          {formType === 'DEPOSIT' && <FormDeposit hasDepositAndStake={hasDepositAndStake} {...transferProps} />}
          {formType === 'DEPOSIT_STAKE' && (
            <>
              {poolDataCacheOrApi.gauge.isKilled ? (
                <AlertBox alertType="warning">{t`Staking is disabled due to inactive Gauge.`}</AlertBox>
              ) : (
                <FormDepositStake hasDepositAndStake={hasDepositAndStake} {...transferProps} />
              )}
            </>
          )}
          {formType === 'STAKE' && (
            <>
              {poolDataCacheOrApi.gauge.isKilled ? (
                <AlertBox alertType="warning">{t`Staking is disabled due to inactive Gauge.`}</AlertBox>
              ) : (
                <FormStake hasDepositAndStake={hasDepositAndStake} {...transferProps} />
              )}
            </>
          )}
        </>
      )}
    </>
  )
}

export default Deposit
