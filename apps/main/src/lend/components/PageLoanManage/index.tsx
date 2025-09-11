import { useMemo, useEffect, useState } from 'react'
import LoanBorrowMore from '@/lend/components/PageLoanManage/LoanBorrowMore'
import LoanCollateralAdd from '@/lend/components/PageLoanManage/LoanCollateralAdd'
import LoanCollateralRemove from '@/lend/components/PageLoanManage/LoanCollateralRemove'
import LoanRepay from '@/lend/components/PageLoanManage/LoanRepay'
import LoanSelfLiquidation from '@/lend/components/PageLoanManage/LoanSelfLiquidation'
import type { CollateralFormType, LeverageFormType, LoanFormType } from '@/lend/components/PageLoanManage/types'
import useStore from '@/lend/store/useStore'
import { type MarketUrlParams, PageContentProps } from '@/lend/types/lend.types'
import { getLoanManagePathname } from '@/lend/utils/utilsRouter'
import { AppFormContent, AppFormContentWrapper } from '@ui/AppForm'
import { useNavigate } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher, type TabOption } from '@ui-kit/shared/ui/TabsSwitcher'

const tabsLoan: TabOption<LoanFormType>[] = [
  { value: 'loan-increase', label: t`Borrow more` },
  { value: 'loan-decrease', label: t`Repay` },
  { value: 'loan-liquidate', label: t`Self-liquidate` },
]

const tabsCollateral: TabOption<CollateralFormType>[] = [
  { value: 'collateral-increase', label: t`Add collateral` },
  { value: 'collateral-decrease', label: t`Remove collateral` },
]

const tabsLeverage: TabOption<LeverageFormType>[] = [{ value: 'leverage-borrow-more', label: t`Borrow more` }]

const ManageLoan = (pageProps: PageContentProps & { params: MarketUrlParams }) => {
  const { rOwmId, rFormType, market, rChainId, params } = pageProps
  const push = useNavigate()

  const { initCampaignRewards, initiated } = useStore((state) => state.campaigns)

  type Tab = 'loan' | 'collateral' | 'leverage'
  const tabs: TabOption<Tab>[] = useMemo(
    () => [
      { value: 'loan' as const, label: t`Loan` },
      { value: 'collateral' as const, label: t`Collateral` },
      ...(market?.leverage?.hasLeverage() ? [{ value: 'leverage' as const, label: t`Leverage` }] : []),
    ],
    [market?.leverage],
  )

  type SubTab = LoanFormType | CollateralFormType | LeverageFormType
  const [subTab, setSubTab] = useState<SubTab>('loan-increase')

  // init campaignRewardsMapper
  useEffect(() => {
    if (!initiated) {
      initCampaignRewards(rChainId)
    }
  }, [initCampaignRewards, rChainId, initiated])

  const subTabs =
    !rFormType || rFormType === 'loan'
      ? tabsLoan
      : rFormType === 'collateral'
        ? tabsCollateral
        : rFormType === 'leverage'
          ? tabsLeverage
          : []

  return (
    <AppFormContent variant="primary">
      <TabsSwitcher
        variant="contained"
        size="medium"
        value={!rFormType ? 'loan' : rFormType}
        onChange={(key) => push(getLoanManagePathname(params, rOwmId, key))}
        options={tabs}
      />

      <TabsSwitcher
        variant="underlined"
        size="small"
        value={subTab}
        onChange={setSubTab}
        options={subTabs}
        fullWidth
        sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}
      />

      <AppFormContentWrapper>
        {subTab === 'loan-increase' && <LoanBorrowMore {...pageProps} />}
        {subTab === 'loan-decrease' && <LoanRepay {...pageProps} />}
        {subTab === 'loan-liquidate' && <LoanSelfLiquidation {...pageProps} />}
        {subTab === 'collateral-increase' && <LoanCollateralAdd {...pageProps} />}
        {subTab === 'collateral-decrease' && <LoanCollateralRemove {...pageProps} />}
        {subTab === 'leverage-borrow-more' && <LoanBorrowMore isLeverage {...pageProps} />}
      </AppFormContentWrapper>
    </AppFormContent>
  )
}

export default ManageLoan
