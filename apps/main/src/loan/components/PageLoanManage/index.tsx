import { useEffect, useMemo, useState } from 'react'
import { AddCollateralForm } from '@/llamalend/features/manage-loan/components/AddCollateralForm'
import { RemoveCollateralForm } from '@/llamalend/features/manage-loan/components/RemoveCollateralForm'
import { RepayForm } from '@/llamalend/features/manage-loan/components/RepayForm'
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
import networks from '@/loan/networks'
import { hasDeleverage } from '@/loan/utils/leverage'
import { getLoanManagePathname } from '@/loan/utils/utilsRouter'
import Stack from '@mui/material/Stack'
import { AppFormContentWrapper } from '@ui/AppForm'
import { useNavigate } from '@ui-kit/hooks/router'
import { useManageLoanMuiForm } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { type TabOption, TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

interface Props extends PageLoanManageProps {}

const { MaxWidth } = SizesAndSpaces

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
  const shouldUseManageLoanMuiForm = useManageLoanMuiForm()
  const useMuiForm = shouldUseManageLoanMuiForm && !!llamma
  const leverageEnabled = !!llamma?.leverageV2?.hasLeverage?.()

  const tabsLoanMui: TabOption<LoanFormType>[] = useMemo(
    () => [
      { value: 'loan-increase', label: t`Borrow more` },
      ...(leverageEnabled
        ? ([
            { value: 'loan-repay-collateral', label: t`Repay from collateral` },
            { value: 'loan-repay-wallet', label: t`Repay from wallet` },
          ] as const)
        : ([{ value: 'loan-decrease', label: t`Repay` }] as const)),
      { value: 'loan-liquidate', label: t`Self-liquidate` },
    ],
    [leverageEnabled],
  )

  type Tab = 'loan' | 'collateral' | 'deleverage'
  const tabs: TabOption<Tab>[] = [
    { value: 'loan' as const, label: t`Loan` },
    { value: 'collateral' as const, label: t`Collateral` },
    ...(hasDeleverage(llamma) ? [{ value: 'deleverage' as const, label: t`Delever` }] : []),
  ]

  type SubTab = LoanFormType | CollateralFormType
  const [subTab, setSubTab] = useState<SubTab>('loan-increase')

  const subTabs = useMemo(
    () =>
      rFormType === 'loan' ? (useMuiForm ? tabsLoanMui : tabsLoan) : rFormType === 'collateral' ? tabsCollateral : [],
    [rFormType, tabsLoanMui, useMuiForm],
  )
  useEffect(() => setSubTab(subTabs[0]?.value), [subTabs])

  const formProps = { curve, isReady, llamma, llammaId, rChainId }

  return (
    <Stack
      sx={{
        width: { mobile: '100%', tablet: MaxWidth.actionCard },
        marginInline: { mobile: 'auto', desktop: 0 },
      }}
    >
      <TabsSwitcher
        variant="contained"
        size="medium"
        value={!rFormType ? 'loan' : rFormType}
        onChange={(key) => push(getLoanManagePathname(params, rCollateralId, key as FormType))}
        options={tabs}
      />

      {useMuiForm ? (
        <>
          <TabsSwitcher
            variant="underlined"
            size="small"
            value={subTab}
            onChange={setSubTab}
            options={subTabs}
            fullWidth
          />

          {subTab === 'loan-increase' && (
            <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
              <AppFormContentWrapper>
                <LoanIncrease {...formProps} />
              </AppFormContentWrapper>
            </Stack>
          )}
          {subTab === 'loan-repay-wallet' && leverageEnabled && llamma && (
            <RepayForm
              networks={networks}
              chainId={rChainId}
              market={llamma}
              enabled={isReady}
              fromBorrowed
              fromWallet
            />
          )}
          {(subTab === 'loan-repay-collateral' || subTab === 'loan-decrease') && llamma && (
            <RepayForm networks={networks} chainId={rChainId} market={llamma} enabled={isReady} fromCollateral />
          )}
          {subTab === 'loan-liquidate' && <LoanLiquidate {...formProps} params={params} />}
          {subTab === 'collateral-increase' && llamma && (
            <AddCollateralForm
              networks={networks}
              chainId={rChainId}
              market={llamma}
              enabled={isReady}
              onAdded={async () => {}}
            />
          )}
          {subTab === 'collateral-decrease' && llamma && (
            <RemoveCollateralForm
              networks={networks}
              chainId={rChainId}
              market={llamma}
              enabled={isReady}
              onRemoved={async () => {}}
            />
          )}
          {/** Deleverage has no subtabs */}
          {rFormType === 'deleverage' && <LoanDeleverage {...formProps} params={params} />}
        </>
      ) : (
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
            {subTab === 'loan-increase' && <LoanIncrease {...formProps} />}
            {subTab === 'loan-decrease' && <LoanDecrease {...formProps} params={params} />}
            {subTab === 'loan-liquidate' && <LoanLiquidate {...formProps} params={params} />}
            {subTab === 'collateral-increase' && <CollateralIncrease {...formProps} />}
            {subTab === 'collateral-decrease' && <CollateralDecrease {...formProps} />}
            {/** Deleverage has no subtabs */}
            {rFormType === 'deleverage' && <LoanDeleverage {...formProps} params={params} />}
          </AppFormContentWrapper>
        </Stack>
      )}
    </Stack>
  )
}

export default LoanManage
