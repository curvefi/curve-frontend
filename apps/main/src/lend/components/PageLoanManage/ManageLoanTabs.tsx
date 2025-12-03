import LoanBorrowMore, { LoanBorrowMoreWrapped } from '@/lend/components/PageLoanManage/LoanBorrowMore'
import LoanCollateralAdd, { LoanAddCollateralTab } from '@/lend/components/PageLoanManage/LoanCollateralAdd'
import LoanCollateralRemove, { LoanRemoveCollateralTab } from '@/lend/components/PageLoanManage/LoanCollateralRemove'
import LoanRepay, {
  LoanRepayFromCollateralTab,
  LoanRepayFromWalletTab,
} from '@/lend/components/PageLoanManage/LoanRepay'
import LoanSelfLiquidation from '@/lend/components/PageLoanManage/LoanSelfLiquidation'
import networks from '@/lend/networks'
import { type MarketUrlParams, PageContentProps } from '@/lend/types/lend.types'
import { useClosePositionTab } from '@/llamalend/features/manage-soft-liquidation/hooks/useClosePositionTab'
import { useImproveHealthTab } from '@/llamalend/features/manage-soft-liquidation/hooks/useImproveHealthTab'
import { ClosePosition } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ClosePosition'
import { ImproveHealth } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ImproveHealth'
import { useManageLoanMuiForm, useManageSoftLiquidation } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { type FormTab, FormTabs } from '@ui-kit/shared/ui/FormTabs/FormTabs'

type ManageLoanProps = PageContentProps<MarketUrlParams>

export const ImproveHealthTab = ({ rChainId, rOwmId }: ManageLoanProps) => (
  <ImproveHealth {...useImproveHealthTab({ chainId: rChainId, network: networks[rChainId], marketId: rOwmId })} />
)

export const ClosePositionTab = ({ rChainId, rOwmId }: ManageLoanProps) => (
  <ClosePosition {...useClosePositionTab({ chainId: rChainId, network: networks[rChainId], marketId: rOwmId })} />
)

export const LendManageLegacyMenu = [
  {
    value: 'loan',
    label: t`Borrow`,
    subTabs: [
      { value: 'loan-increase', label: t`Borrow more`, component: LoanBorrowMore },
      { value: 'loan-decrease', label: t`Repay`, component: LoanRepay },
      { value: 'loan-liquidate', label: t`Self-liquidate`, component: LoanSelfLiquidation },
    ],
  },
  {
    value: 'collateral',
    label: t`Borrow`,
    subTabs: [
      { value: 'collateral-increase', label: t`Add collateral`, component: LoanCollateralAdd },
      { value: 'collateral-decrease', label: t`Remove collateral`, component: LoanCollateralRemove },
    ],
  },
  {
    value: 'leverage',
    label: t`Leverage`,
    visible: ({ market }) => market?.leverage?.hasLeverage(),
    component: LoanBorrowMore,
  },
] satisfies FormTab<ManageLoanProps>[]

export const LendManageNewMenu = [
  {
    value: 'borrow',
    label: ({ market }) => (market?.leverage?.hasLeverage() ? t`Leverage` : t`Borrow`),
    component: LoanBorrowMoreWrapped,
  },
  {
    value: 'repay',
    label: t`Repay`,
    subTabs: [
      { value: 'from-wallet', label: t`From wallet`, component: LoanRepayFromWalletTab },
      { value: 'from-collateral', label: t`From collateral`, component: LoanRepayFromCollateralTab },
    ],
  },
  {
    value: 'collateral',
    label: t`Collateral`,
    subTabs: [
      { value: 'add', label: t`Add`, component: LoanAddCollateralTab },
      { value: 'remove', label: t`Remove`, component: LoanRemoveCollateralTab },
    ],
  },
] satisfies FormTab<ManageLoanProps>[]

export const LendManageSoftLiquidationMenu = [
  {
    value: 'soft-liquidation',
    label: t`Manage soft liquidation`,
    subTabs: [
      { value: 'improve-health', label: t`Improve health`, component: ImproveHealthTab },
      { value: 'close-position', label: t`Close position`, component: ClosePositionTab },
    ],
  },
] satisfies FormTab<ManageLoanProps>[]

export const ManageLoanTabs = ({
  isInSoftLiquidation,
  ...pageProps
}: ManageLoanProps & { isInSoftLiquidation: boolean | undefined }) => {
  const { rFormType } = pageProps
  const shouldUseSoftLiquidation = useManageSoftLiquidation() && isInSoftLiquidation
  const shouldUseManageLoanMuiForm = useManageLoanMuiForm()
  const menu = shouldUseSoftLiquidation
    ? LendManageSoftLiquidationMenu
    : shouldUseManageLoanMuiForm
      ? LendManageNewMenu
      : LendManageLegacyMenu
  const shouldWrap = menu === LendManageLegacyMenu
  return <FormTabs params={pageProps} menu={menu} shouldWrap={shouldWrap} defaultTab={rFormType} />
}
