import { useMemo, useEffect, useState } from 'react'
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
import useStore from '@/lend/store/useStore'
import { type MarketUrlParams, PageContentProps } from '@/lend/types/lend.types'
import { getLoanManagePathname } from '@/lend/utils/utilsRouter'
import { AppFormContent, AppFormContentWrapper } from '@ui/AppForm'
import { useNavigate } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'

const ManageLoan = (pageProps: PageContentProps & { params: MarketUrlParams }) => {
  const { rOwmId, rFormType, market, rChainId, params } = pageProps
  const push = useNavigate()

  const { initCampaignRewards, initiated } = useStore((state) => state.campaigns)

  const FORM_TYPES = useMemo(() => {
    const forms: { value: FormType; label: string }[] = [
      { value: 'loan', label: t`Loan` },
      { value: 'collateral', label: t`Collateral` },
    ]

    if (market?.leverage?.hasLeverage()) {
      forms.push({ value: 'leverage', label: t`Leverage` })
    }

    return forms
  }, [market?.leverage])

  const TABS_LOAN: { value: LoanFormType; label: string }[] = [
    { value: 'loan-increase', label: t`Borrow more` },
    { value: 'loan-decrease', label: t`Repay` },
    { value: 'loan-liquidate', label: t`Self-liquidate` },
  ]

  const TABS_COLLATERAL: { value: CollateralFormType; label: string }[] = [
    { value: 'collateral-increase', label: t`Add collateral` },
    { value: 'collateral-decrease', label: t`Remove collateral` },
  ]

  const TABS_LEVERAGE: { value: LeverageFormType; label: string }[] = [
    { value: 'leverage-borrow-more', label: t`Borrow more` },
  ]

  type Tabs = LoanFormType | CollateralFormType | LeverageFormType
  const [selectedTab, setSelectedTab] = useState<Tabs>('loan-increase')

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
    <AppFormContent variant="primary">
      <TabsSwitcher
        variant="contained"
        size="medium"
        value={!rFormType ? 'loan' : rFormType}
        onChange={(key) => push(getLoanManagePathname(params, rOwmId, key))}
        options={FORM_TYPES}
      />

      <TabsSwitcher
        variant="underlined"
        size="small"
        value={selectedTab}
        onChange={setSelectedTab}
        options={tabs}
        sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, '& .MuiTab-root': { flexGrow: 1 } }}
      />

      <AppFormContentWrapper>
        {selectedTab === 'loan-increase' && <LoanBorrowMore {...pageProps} />}
        {selectedTab === 'loan-decrease' && <LoanRepay {...pageProps} />}
        {selectedTab === 'loan-liquidate' && <LoanSelfLiquidation {...pageProps} />}
        {selectedTab === 'collateral-increase' && <LoanCollateralAdd {...pageProps} />}
        {selectedTab === 'collateral-decrease' && <LoanCollateralRemove {...pageProps} />}
        {selectedTab === 'leverage-borrow-more' && <LoanBorrowMore isLeverage {...pageProps} />}
      </AppFormContentWrapper>
    </AppFormContent>
  )
}

export default ManageLoan
