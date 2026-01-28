import { LoanBorrowMore } from '@/lend/components/PageLendMarket/LoanBorrowMore'
import { LoanCollateralAdd } from '@/lend/components/PageLendMarket/LoanCollateralAdd'
import { LoanCollateralRemove } from '@/lend/components/PageLendMarket/LoanCollateralRemove'
import { LoanRepay } from '@/lend/components/PageLendMarket/LoanRepay'
import { LoanSelfLiquidation } from '@/lend/components/PageLendMarket/LoanSelfLiquidation'
import { networks } from '@/lend/networks'
import { type MarketUrlParams, PageContentProps } from '@/lend/types/lend.types'
import { AddCollateralForm } from '@/llamalend/features/manage-loan/components/AddCollateralForm'
import { BorrowMoreForm } from '@/llamalend/features/manage-loan/components/BorrowMoreForm'
import { RemoveCollateralForm } from '@/llamalend/features/manage-loan/components/RemoveCollateralForm'
import { RepayForm } from '@/llamalend/features/manage-loan/components/RepayForm'
import { useClosePositionTab } from '@/llamalend/features/manage-soft-liquidation/hooks/useClosePositionTab'
import { useImproveHealthTab } from '@/llamalend/features/manage-soft-liquidation/hooks/useImproveHealthTab'
import { ClosePosition } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ClosePosition'
import { ImproveHealth } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ImproveHealth'
import type { BorrowPositionDetailsProps } from '@/llamalend/features/market-position-details'
import { useManageLoanMuiForm, useManageSoftLiquidation } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { type FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'

type ManageLoanProps = PageContentProps<MarketUrlParams>

const ImproveHealthTab = ({ rChainId, rOwmId }: ManageLoanProps) => (
  <ImproveHealth {...useImproveHealthTab({ chainId: rChainId, network: networks[rChainId], marketId: rOwmId })} />
)

const ClosePositionTab = ({ rChainId, rOwmId }: ManageLoanProps) => (
  <ClosePosition {...useClosePositionTab({ chainId: rChainId, network: networks[rChainId], marketId: rOwmId })} />
)

const LendManageLegacyMenu = [
  {
    value: 'loan',
    label: t`Loan`,
    subTabs: [
      { value: 'loan-increase', label: t`Borrow more`, component: LoanBorrowMore },
      { value: 'loan-decrease', label: t`Repay`, component: LoanRepay },
      { value: 'loan-liquidate', label: t`Self-liquidate`, component: LoanSelfLiquidation },
    ],
  },
  {
    value: 'collateral',
    label: t`Collateral`,
    subTabs: [
      { value: 'collateral-increase', label: t`Add collateral`, component: LoanCollateralAdd },
      { value: 'collateral-decrease', label: t`Remove collateral`, component: LoanCollateralRemove },
    ],
  },
  {
    value: 'leverage',
    label: t`Leverage`,
    visible: ({ market }) => market?.leverage?.hasLeverage(),
    component: (props) => <LoanBorrowMore {...props} isLeverage />,
  },
] satisfies FormTab<ManageLoanProps>[]

const LendManageNewMenu = [
  {
    value: 'loan-increase',
    label: t`Borrow`,
    component: ({ rChainId, market, isLoaded }: PageContentProps) => (
      <BorrowMoreForm networks={networks} chainId={rChainId} market={market} enabled={isLoaded} />
    ),
  },
  {
    value: 'loan-decrease',
    label: t`Repay`,
    component: ({ rChainId, market, isLoaded }: PageContentProps) => (
      <RepayForm networks={networks} chainId={rChainId} market={market} enabled={isLoaded} />
    ),
  },
  {
    value: 'collateral',
    label: t`Collateral`,
    subTabs: [
      {
        value: 'add',
        label: t`Add`,
        component: ({ rChainId, market, isLoaded }: PageContentProps) => (
          <AddCollateralForm networks={networks} chainId={rChainId} market={market} enabled={isLoaded} />
        ),
      },
      {
        value: 'remove',
        label: t`Remove`,
        component: ({ rChainId, market, isLoaded }: PageContentProps) => (
          <RemoveCollateralForm networks={networks} chainId={rChainId} market={market} enabled={isLoaded} />
        ),
      },
    ],
  },
] satisfies FormTab<ManageLoanProps>[]

const LendManageSoftLiquidationMenu = [
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
  position: {
    liquidationAlert: { softLiquidation, hardLiquidation },
  },
  ...pageProps
}: ManageLoanProps & { position: BorrowPositionDetailsProps }) => {
  const shouldUseSoftLiquidation = useManageSoftLiquidation() && (softLiquidation || hardLiquidation)
  const shouldUseManageLoanMuiForm = useManageLoanMuiForm()
  const menu = shouldUseSoftLiquidation
    ? LendManageSoftLiquidationMenu
    : shouldUseManageLoanMuiForm
      ? LendManageNewMenu
      : LendManageLegacyMenu
  return <FormTabs params={pageProps} menu={menu} shouldWrap={menu === LendManageLegacyMenu} />
}
