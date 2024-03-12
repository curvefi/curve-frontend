import type { CollateralFormType, FormType, LoanFormType } from '@/components/PageLoanManage/types'

import { useCallback, useRef } from 'react'
import { t } from '@lingui/macro'
import { useNavigate, useParams } from 'react-router-dom'

import { getLoanCreatePathname, getLoanManagePathname } from '@/utils/utilsRouter'
import { useSlideTabState } from '@/ui/hooks'
import useStore from '@/store/useStore'

import { FormContent, FormContentWrapper, FormSlideTab } from '@/components/SharedFormStyles/styles'
import FormHeader from '@/components/SharedFormStyles/FormHeader'
import SlideTabsWrapper, { SlideTabs } from '@/ui/TabSlide'
import LoanBorrowMore from '@/components/PageLoanManage/LoanBorrowMore'
import LoanRepay from '@/components/PageLoanManage/LoanRepay'
import LoanSelfLiquidation from '@/components/PageLoanManage/LoanSelfLiquidation'
import LoanCollateralAdd from '@/components/PageLoanManage/LoanCollateralAdd'
import LoanCollateralRemove from '@/components/PageLoanManage/LoanCollateralRemove'

const ManageLoan = (pageProps: PageContentProps) => {
  const { rOwmId, rFormType, userActiveKey } = pageProps
  const params = useParams()
  const navigate = useNavigate()
  const tabsRef = useRef<HTMLDivElement>(null)
  const { selectedTabIdx, tabPositions, setSelectedTabIdx } = useSlideTabState(tabsRef, rFormType)

  const loanExistsResp = useStore((state) => state.user.loansExistsMapper[userActiveKey])

  const FORM_TYPES: { key: FormType; label: string }[] = [
    { label: t`Manage Loan`, key: 'loan' },
    { label: t`Collateral`, key: 'collateral' },
  ]

  const TABS_LOAN: { label: string; formType: LoanFormType }[] = [
    { label: t`Borrow more`, formType: 'loan-increase' },
    { label: t`Repay`, formType: 'loan-decrease' },
    { label: t`Self-liquidate`, formType: 'loan-liquidate' },
    // { label: t`Add collateral`, formType: 'collateral-increase' },
    // { label: t`Remove collateral`, formType: 'collateral-decrease' },
  ]

  const TABS_COLLATERAL: { label: string; formType: CollateralFormType }[] = [
    { label: t`Add collateral`, formType: 'collateral-increase' },
    { label: t`Remove collateral`, formType: 'collateral-decrease' },
  ]

  const handleTabClick = useCallback(
    (cb: () => void) => {
      if (typeof loanExistsResp !== 'undefined' && !loanExistsResp.loanExists) {
        navigate(getLoanCreatePathname(params, rOwmId, 'create'))
      } else if (typeof cb === 'function') {
        cb()
      }
    },
    [loanExistsResp, navigate, params, rOwmId]
  )

  const tabs = !rFormType || rFormType === 'loan' ? TABS_LOAN : rFormType === 'collateral' ? TABS_COLLATERAL : []

  return (
    <FormContent variant="primary" shadowed>
      <FormHeader
        formTypes={FORM_TYPES}
        activeFormKey={!rFormType ? 'loan' : (rFormType as string)}
        handleClick={(key) => navigate(getLoanManagePathname(params, rOwmId, key))}
      />

      <FormContentWrapper grid gridRowGap={3} padding>
        {/* FORMS SELECTOR */}
        {tabs.length > 0 && (
          <SlideTabsWrapper activeIdx={selectedTabIdx}>
            <SlideTabs ref={tabsRef}>
              {tabs.map(({ label }, idx) => {
                return (
                  <FormSlideTab
                    key={label}
                    disabled={selectedTabIdx === idx}
                    tabLeft={tabPositions[idx]?.left}
                    tabWidth={tabPositions[idx]?.width}
                    tabTop={tabPositions[idx]?.top}
                    onChange={() => handleTabClick(() => setSelectedTabIdx(idx))}
                    tabIdx={idx}
                    label={label}
                  />
                )
              })}
            </SlideTabs>
          </SlideTabsWrapper>
        )}

        {/* FORMS */}
        {!rFormType || rFormType === 'loan' ? (
          <>
            {selectedTabIdx === 0 && <LoanBorrowMore {...pageProps} />}
            {selectedTabIdx === 1 && <LoanRepay {...pageProps} />}
            {selectedTabIdx === 2 && <LoanSelfLiquidation {...pageProps} />}
          </>
        ) : rFormType === 'collateral' ? (
          <>
            {selectedTabIdx === 0 && <LoanCollateralAdd {...pageProps} />}
            {selectedTabIdx === 1 && <LoanCollateralRemove {...pageProps} />}
          </>
        ) : null}
      </FormContentWrapper>
    </FormContent>
  )
}

export default ManageLoan
