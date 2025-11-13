import { useEffect, useMemo, useState } from 'react'
import LoanBorrowMore from '@/lend/components/PageLoanManage/LoanBorrowMore'
import LoanCollateralAdd from '@/lend/components/PageLoanManage/LoanCollateralAdd'
import LoanCollateralRemove from '@/lend/components/PageLoanManage/LoanCollateralRemove'
import LoanRepay from '@/lend/components/PageLoanManage/LoanRepay'
import LoanSelfLiquidation from '@/lend/components/PageLoanManage/LoanSelfLiquidation'
import type { CollateralFormType, LeverageFormType, LoanFormType } from '@/lend/components/PageLoanManage/types'
import { type MarketUrlParams, PageContentProps } from '@/lend/types/lend.types'
import { getLoanManagePathname } from '@/lend/utils/utilsRouter'
import Stack from '@mui/material/Stack'
import { AppFormContentWrapper } from '@ui/AppForm'
import { useNavigate } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { type TabOption, TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'

const tabsLoan: TabOption<LoanFormType>[] = [
  { value: 'loan-increase', label: t`Borrow more` },
  { value: 'loan-decrease', label: t`Repay` },
  { value: 'loan-liquidate', label: t`Self-liquidate` },
]

const tabsCollateral: TabOption<CollateralFormType>[] = [
  { value: 'collateral-increase', label: t`Add collateral` },
  { value: 'collateral-decrease', label: t`Remove collateral` },
]

const ManageLoan = (pageProps: PageContentProps & { params: MarketUrlParams }) => {
  const { rOwmId, rFormType, market, params } = pageProps
  const push = useNavigate()

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
  const [subTab, setSubTab] = useState<SubTab | undefined>('loan-increase')

  const subTabs = useMemo(
    () => (!rFormType || rFormType === 'loan' ? tabsLoan : rFormType === 'collateral' ? tabsCollateral : []),
    [rFormType],
  )

  useEffect(() => setSubTab(subTabs[0]?.value), [subTabs])

  return (
    <Stack>
      <TabsSwitcher
        variant="contained"
        size="medium"
        value={!rFormType ? 'loan' : rFormType}
        onChange={(key) => push(getLoanManagePathname(params, rOwmId, key))}
        options={tabs}
      />
      <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
        <TabsSwitcher
          variant="underlined"
          size="small"
          value={subTab}
          onChange={setSubTab}
          options={subTabs}
          fullWidth
        />

        <AppFormContentWrapper>
          {subTab === 'loan-increase' && <LoanBorrowMore {...pageProps} />}
          {subTab === 'loan-decrease' && <LoanRepay {...pageProps} />}
          {subTab === 'loan-liquidate' && <LoanSelfLiquidation {...pageProps} />}
          {subTab === 'collateral-increase' && <LoanCollateralAdd {...pageProps} />}
          {subTab === 'collateral-decrease' && <LoanCollateralRemove {...pageProps} />}
          {/** Leverage has no subtabs */}
          {rFormType === 'leverage' && <LoanBorrowMore isLeverage {...pageProps} />}
        </AppFormContentWrapper>
      </Stack>
    </Stack>
  )
}

export default ManageLoan
