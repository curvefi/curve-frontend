import { useState } from 'react'
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
import { AppFormContent, AppFormContentWrapper } from '@ui/AppForm'
import { useNavigate } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'

interface Props extends PageLoanManageProps {}

const LoanManage = ({ curve, isReady, llamma, llammaId, params, rChainId, rCollateralId, rFormType }: Props) => {
  const push = useNavigate()

  const FORM_TYPES: { value: string; label: string }[] = [
    { value: 'loan', label: t`Loan` },
    { value: 'collateral', label: t`Collateral` },
    { value: 'deleverage', label: t`Delever` },
  ].filter((f) => {
    if (f.value === 'deleverage') {
      return hasDeleverage(llamma)
    } else {
      return true
    }
  })

  const LOAN_TABS: { value: LoanFormType; label: string }[] = [
    { value: 'loan-increase', label: t`Borrow more` },
    { value: 'loan-decrease', label: t`Repay` },
    { value: 'loan-liquidate', label: t`Self-liquidate` },
  ]

  const COLLATERAL_TABS: { value: CollateralFormType; label: string }[] = [
    { value: 'collateral-increase', label: t`Add` },
    { value: 'collateral-decrease', label: t`Remove` },
  ]

  type Tabs = LoanFormType | CollateralFormType
  const [selectedTab, setSelectedTab] = useState<Tabs>('loan-increase')

  const tabs = rFormType === 'loan' ? LOAN_TABS : rFormType === 'collateral' ? COLLATERAL_TABS : []
  const formProps = { curve, isReady, llamma, llammaId, rChainId }

  return (
    <AppFormContent variant="primary">
      <TabsSwitcher
        variant="contained"
        size="medium"
        value={!rFormType ? 'loan' : rFormType}
        onChange={(key) => push(getLoanManagePathname(params, rCollateralId, key as FormType))}
        options={FORM_TYPES}
      />

      <TabsSwitcher
        variant="underlined"
        size="small"
        value={selectedTab}
        onChange={setSelectedTab}
        options={tabs}
        fullWidth
        sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}
      />

      <AppFormContentWrapper>
        {selectedTab === 'loan-increase' && <LoanIncrease {...formProps} />}
        {selectedTab === 'loan-decrease' && <LoanDecrease {...formProps} params={params} />}
        {selectedTab === 'loan-liquidate' && <LoanLiquidate {...formProps} params={params} />}
        {rFormType === 'deleverage' && <LoanDeleverage {...formProps} params={params} />}
        {selectedTab === 'collateral-increase' && <CollateralIncrease {...formProps} />}
        {selectedTab === 'collateral-decrease' && <CollateralDecrease {...formProps} />}
      </AppFormContentWrapper>
    </AppFormContent>
  )
}

export default LoanManage
