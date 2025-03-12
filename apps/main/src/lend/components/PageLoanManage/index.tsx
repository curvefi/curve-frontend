import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useRef, useEffect } from 'react'
import LoanBorrowMore from '@/lend/components/PageLoanManage/LoanBorrowMore'
import LoanCollateralAdd from '@/lend/components/PageLoanManage/LoanCollateralAdd'
import LoanCollateralRemove from '@/lend/components/PageLoanManage/LoanCollateralRemove'
import LoanRepay from '@/lend/components/PageLoanManage/LoanRepay'
import LoanSelfLiquidation from '@/lend/components/PageLoanManage/LoanSelfLiquidation'
import type {
  CollateralFormType,
  FormType,
  LeverageFormType,
  LoanFormType,
} from '@/lend/components/PageLoanManage/types'
import useSlideTabState from '@/lend/hooks/useSlideTabState'
import useStore from '@/lend/store/useStore'
import { type MarketUrlParams, PageContentProps } from '@/lend/types/lend.types'
import { getLoanCreatePathname, getLoanManagePathname } from '@/lend/utils/utilsRouter'
import { AppFormContent, AppFormContentWrapper, AppFormHeader, AppFormSlideTab } from '@ui/AppForm'
import SlideTabsWrapper, { SlideTabs } from '@ui/TabSlide'
import { t } from '@ui-kit/lib/i18n'

const ManageLoan = (pageProps: PageContentProps & { params: MarketUrlParams }) => {
  const { rOwmId, rFormType, userActiveKey, market, rChainId, params } = pageProps
  const { push } = useRouter()
  const tabsRef = useRef<HTMLDivElement>(null)
  const { selectedTabIdx, tabPositions, setSelectedTabIdx } = useSlideTabState(tabsRef, rFormType)

  const loanExistsResp = useStore((state) => state.user.loansExistsMapper[userActiveKey])
  const { initCampaignRewards, initiated } = useStore((state) => state.campaigns)

  const FORM_TYPES = useMemo(() => {
    const forms: { key: FormType; label: string }[] = [
      { label: t`Loan`, key: 'loan' },
      { label: t`Collateral`, key: 'collateral' },
    ]

    if (market?.leverage?.hasLeverage()) {
      forms.push({ label: t`Leverage`, key: 'leverage' })
    }

    return forms
  }, [market?.leverage])

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

  const TABS_LEVERAGE: { label: string; formType: LeverageFormType }[] = [
    { label: t`Borrow more`, formType: 'leverage-borrow-more' },
  ]

  const handleTabClick = useCallback(
    (cb: () => void) => {
      if (typeof loanExistsResp !== 'undefined' && !loanExistsResp.loanExists) {
        push(getLoanCreatePathname(params, rOwmId, 'create'))
      } else if (typeof cb === 'function') {
        cb()
      }
    },
    [loanExistsResp, push, params, rOwmId],
  )

  // init campaignRewardsMapper
  useEffect(() => {
    if (!initiated) {
      initCampaignRewards(rChainId)
    }
  }, [initCampaignRewards, rChainId, initiated])

  const tabs =
    !rFormType || rFormType === 'loan'
      ? TABS_LOAN
      : rFormType === 'collateral'
        ? TABS_COLLATERAL
        : rFormType === 'leverage'
          ? TABS_LEVERAGE
          : []

  return (
    <AppFormContent variant="primary" shadowed>
      <AppFormHeader
        formTypes={FORM_TYPES}
        activeFormKey={!rFormType ? 'loan' : (rFormType as string)}
        handleClick={(key: string) => push(getLoanManagePathname(params, rOwmId, key))}
      />

      <AppFormContentWrapper grid gridRowGap={3} padding>
        {/* FORMS SELECTOR */}
        {tabs.length > 0 && (
          <SlideTabsWrapper activeIdx={selectedTabIdx}>
            <SlideTabs ref={tabsRef}>
              {tabs.map(({ label }, idx) => (
                <AppFormSlideTab
                  key={label}
                  disabled={selectedTabIdx === idx}
                  tabLeft={tabPositions[idx]?.left}
                  tabWidth={tabPositions[idx]?.width}
                  tabTop={tabPositions[idx]?.top}
                  onChange={() => handleTabClick(() => setSelectedTabIdx(idx))}
                  tabIdx={idx}
                  label={label}
                />
              ))}
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
        ) : rFormType === 'leverage' ? (
          <>{selectedTabIdx === 0 && <LoanBorrowMore isLeverage {...pageProps} />}</>
        ) : null}
      </AppFormContentWrapper>
    </AppFormContent>
  )
}

export default ManageLoan
