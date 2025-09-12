import { useEffect, useMemo, useState } from 'react'
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
import { getLoanManagePathname } from '@/loan/utils/utilsRouter'
import Stack from '@mui/material/Stack'
import { AppFormContentWrapper } from '@ui/AppForm'
import { useNavigate } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher, type TabOption } from '@ui-kit/shared/ui/TabsSwitcher'

interface Props extends PageLoanManageProps {}

const tabsLoan: TabOption<LoanFormType>[] = [
  { value: 'loan-increase', label: t`Borrow more` },
  { value: 'loan-decrease', label: t`Repay` },
  { value: 'loan-liquidate', label: t`Self-liquidate` },
]

const tabsCollateral: TabOption<CollateralFormType>[] = [
  { value: 'collateral-increase', label: t`Add` },
  { value: 'collateral-decrease', label: t`Remove` },
]

const LoanManage = ({ curve, isReady, llamma, llammaId, params, rChainId, rCollateralId, rFormType }: Props) => {
  const push = useNavigate()

  type Tab = 'loan' | 'collateral' | 'deleverage'
  const tabs: TabOption<Tab>[] = [
    { value: 'loan' as const, label: t`Loan` },
    { value: 'collateral' as const, label: t`Collateral` },
    ...(hasDeleverage(llamma) ? [{ value: 'deleverage' as const, label: t`Delever` }] : []),
  ]

  type SubTab = LoanFormType | CollateralFormType
  const [subTab, setSubTab] = useState<SubTab>('loan-increase')

  const subTabs = useMemo(
    () => (rFormType === 'loan' ? tabsLoan : rFormType === 'collateral' ? tabsCollateral : []),
    [rFormType],
  )
  useEffect(() => setSubTab(subTabs[0]?.value), [subTabs])

  const formProps = { curve, isReady, llamma, llammaId, rChainId }

  return (
    <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
      <TabsSwitcher
        variant="contained"
        size="medium"
        value={!rFormType ? 'loan' : rFormType}
        onChange={(key) => push(getLoanManagePathname(params, rCollateralId, key as FormType))}
        options={tabs}
        fullWidth
      />

      <TabsSwitcher variant="underlined" size="small" value={subTab} onChange={setSubTab} options={subTabs} fullWidth />

      <AppFormContentWrapper>
        {subTab === 'loan-increase' && <LoanIncrease {...formProps} />}
        {subTab === 'loan-decrease' && <LoanDecrease {...formProps} params={params} />}
        {subTab === 'loan-liquidate' && <LoanLiquidate {...formProps} params={params} />}
        {subTab === 'collateral-increase' && <CollateralIncrease {...formProps} />}
        {subTab === 'collateral-decrease' && <CollateralDecrease {...formProps} />}
        {/** Deleverage has no subtabs */}
        {rFormType === 'deleverage' && <LoanDeleverage {...formProps} params={params} />}
      </AppFormContentWrapper>
    </Stack>
  )
}

export default LoanManage
