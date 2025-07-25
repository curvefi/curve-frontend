import lodash from 'lodash'
import { useCallback, useEffect, useRef, useState } from 'react'
import { styled } from 'styled-components'
import CollateralDecrease from '@/loan/components/PageLoanManage/CollateralDecrease'
import CollateralIncrease from '@/loan/components/PageLoanManage/CollateralIncrease'
import LoanDecrease from '@/loan/components/PageLoanManage/LoanDecrease'
import LoanDeleverage from '@/loan/components/PageLoanManage/LoanDeleverage'
import LoanIncrease from '@/loan/components/PageLoanManage/LoanIncrease'
import LoanLiquidate from '@/loan/components/PageLoanManage/LoanLiquidate'
import type {
  CollateralFormType,
  FormType,
  LoanFormType,
  PageLoanManageProps,
} from '@/loan/components/PageLoanManage/types'
import { hasDeleverage } from '@/loan/components/PageLoanManage/utils'
import useStore from '@/loan/store/useStore'
import { getLoanCreatePathname, getLoanManagePathname } from '@/loan/utils/utilsRouter'
import { AppFormContent, AppFormContentWrapper, AppFormHeader } from '@ui/AppForm'
import SlideTabsWrapper, { SlideTab, SlideTabs } from '@ui/TabSlide'
import { useNavigate } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'

interface Props extends PageLoanManageProps {}

const LoanManage = ({ curve, isReady, llamma, llammaId, params, rChainId, rCollateralId, rFormType }: Props) => {
  const push = useNavigate()
  const tabsRef = useRef<HTMLDivElement>(null)

  const loanExists = useStore((state) => state.loans.existsMapper[llammaId]?.loanExists)
  const resetUserDetailsState = useStore((state) => state.loans.resetUserDetailsState)

  const [selectedTabIdx, setSelectedTabIdx] = useState(0)
  const [tabPositions, setTabPositions] = useState<{ left: number; width: number; top: number }[]>([])

  const FORM_TYPES: { key: string; label: string }[] = [
    { label: t`Loan`, key: 'loan' },
    { label: t`Collateral`, key: 'collateral' },
    { label: t`Deleverage`, key: 'deleverage' },
    // { label: t`Swap`, key: MANAGE_LOAN_FORM_TYPE.swap }, // hide swap (aka liquidation) from UI for now
  ].filter((f) => {
    if (f.key === 'deleverage') {
      return hasDeleverage(llamma)
    } else {
      return true
    }
  })

  const LOAN_TABS: { label: string; formType: LoanFormType }[] = [
    { label: t`Borrow more`, formType: 'loan-increase' },
    { label: t`Repay`, formType: 'loan-decrease' },
    { label: t`Self-liquidate`, formType: 'loan-liquidate' },
  ]

  const COLLATERAL_TABS: { label: string; formType: CollateralFormType }[] = [
    { label: t`Add`, formType: 'collateral-increase' },
    { label: t`Remove`, formType: 'collateral-decrease' },
  ]

  const shouldContinueAction = useCallback(
    (cb: () => void) => {
      if (loanExists) {
        cb()
      } else {
        if (llamma) resetUserDetailsState(llamma)
        push(getLoanCreatePathname(params, rCollateralId))
      }
    },
    [llamma, loanExists, push, params, rCollateralId, resetUserDetailsState],
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
    setSelectedTabIdx(0)
  }, [rFormType])

  const tabs = rFormType === 'loan' ? LOAN_TABS : rFormType === 'collateral' ? COLLATERAL_TABS : []
  const formProps = { curve, isReady, llamma, llammaId, rChainId }

  return (
    <AppFormContent variant="primary" shadowed>
      <AppFormHeader
        formTypes={FORM_TYPES}
        activeFormKey={!rFormType ? 'loan' : (rFormType as string)}
        handleClick={(key: string) => push(getLoanManagePathname(params, rCollateralId, key as FormType))}
      />

      <AppFormContentWrapper>
        {tabs.length > 0 && (
          <StyledSlideTabsWrapper activeIdx={selectedTabIdx} disabled={typeof loanExists === 'undefined'}>
            <SlideTabs ref={tabsRef}>
              {tabs.map(({ label, formType }, idx) => (
                <SlideTab
                  key={label}
                  disabled={lodash.isUndefined(loanExists)}
                  tabLeft={tabPositions[idx]?.left}
                  tabWidth={tabPositions[idx]?.width}
                  tabTop={tabPositions[idx]?.top}
                  onChange={() => shouldContinueAction(() => setSelectedTabIdx(idx))}
                  tabIdx={idx}
                  label={label}
                />
              ))}
            </SlideTabs>
          </StyledSlideTabsWrapper>
        )}
        <>
          {rFormType === 'loan' ? (
            <>
              {selectedTabIdx === 0 && <LoanIncrease {...formProps} />}
              {selectedTabIdx === 1 && <LoanDecrease {...formProps} params={params} />}
              {selectedTabIdx === 2 && <LoanLiquidate {...formProps} params={params} />}
            </>
          ) : rFormType === 'deleverage' ? (
            <LoanDeleverage {...formProps} params={params} />
          ) : rFormType === 'collateral' ? (
            <>
              {selectedTabIdx === 0 && <CollateralIncrease {...formProps} />}
              {selectedTabIdx === 1 && <CollateralDecrease {...formProps} />}
            </>
          ) : null}
        </>
      </AppFormContentWrapper>
    </AppFormContent>
  )
}

const StyledSlideTabsWrapper = styled(SlideTabsWrapper)`
  margin-bottom: var(--spacing-2);
`

export default LoanManage
