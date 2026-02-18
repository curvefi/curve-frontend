import { LoanBorrowMore } from '@/lend/components/PageLendMarket/LoanBorrowMore'
import { LoanCollateralAdd } from '@/lend/components/PageLendMarket/LoanCollateralAdd'
import { LoanCollateralRemove } from '@/lend/components/PageLendMarket/LoanCollateralRemove'
import { LoanRepay } from '@/lend/components/PageLendMarket/LoanRepay'
import { LoanSelfLiquidation } from '@/lend/components/PageLendMarket/LoanSelfLiquidation'
import { invalidateAllUserBorrowDetails } from '@/lend/entities/user-loan-details'
import { networks } from '@/lend/networks'
import { type MarketUrlParams, PageContentProps } from '@/lend/types/lend.types'
import { AddCollateralForm } from '@/llamalend/features/manage-loan/components/AddCollateralForm'
import { BorrowMoreForm } from '@/llamalend/features/manage-loan/components/BorrowMoreForm'
import { RemoveCollateralForm } from '@/llamalend/features/manage-loan/components/RemoveCollateralForm'
import { RepayForm } from '@/llamalend/features/manage-loan/components/RepayForm'
import { ClosePositionForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ClosePositionForm'
import { ImproveHealthForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ImproveHealthForm'
import type { BorrowPositionDetailsProps } from '@/llamalend/features/market-position-details'
import { useManageLoanMuiForm, useManageSoftLiquidation } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { type FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'

type ManageLoanProps = PageContentProps<MarketUrlParams> & {
  onPricesUpdated: (prices: string[] | undefined) => void
}

const BorrowMoreTab = ({ rChainId, market, isLoaded, onPricesUpdated }: ManageLoanProps) => (
  <BorrowMoreForm
    networks={networks}
    chainId={rChainId}
    market={market}
    enabled={isLoaded}
    onPricesUpdated={onPricesUpdated}
  />
)

const RepayTab = ({ rChainId, market, isLoaded, onPricesUpdated }: ManageLoanProps) => (
  <RepayForm
    networks={networks}
    chainId={rChainId}
    market={market}
    enabled={isLoaded}
    onPricesUpdated={onPricesUpdated}
  />
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
    component: BorrowMoreTab,
  },
  {
    value: 'loan-decrease',
    label: t`Repay`,
    component: RepayTab,
  },
  {
    value: 'collateral',
    label: t`Collateral`,
    subTabs: [
      {
        value: 'add',
        label: t`Add`,
        component: ({ rChainId: chainId, market, userAddress, rOwmId: marketId, isLoaded }: PageContentProps) => (
          <AddCollateralForm
            networks={networks}
            chainId={chainId}
            market={market}
            enabled={isLoaded}
            onAdded={() => invalidateAllUserBorrowDetails({ chainId, marketId, userAddress })}
          />
        ),
      },
      {
        value: 'remove',
        label: t`Remove`,
        component: ({ rChainId: chainId, market, userAddress, rOwmId: marketId, isLoaded }: PageContentProps) => (
          <RemoveCollateralForm
            networks={networks}
            chainId={chainId}
            market={market}
            enabled={isLoaded}
            onRemoved={() => invalidateAllUserBorrowDetails({ chainId, marketId, userAddress })}
          />
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
      {
        value: 'improve-health',
        label: t`Improve health`,
        component: ({
          rChainId: chainId,
          market,
          rOwmId: marketId,
          isLoaded,
          userAddress,
        }: PageContentProps<MarketUrlParams>) => (
          <ImproveHealthForm
            chainId={chainId}
            market={market}
            networks={networks}
            enabled={isLoaded}
            onRepaid={() => invalidateAllUserBorrowDetails({ chainId, marketId, userAddress })}
          />
        ),
      },
      {
        value: 'close-position',
        label: t`Close position`,
        component: ({
          rChainId: chainId,
          rOwmId: marketId,
          market,
          isLoaded,
          userAddress,
        }: PageContentProps<MarketUrlParams>) => (
          <ClosePositionForm
            chainId={chainId}
            networks={networks}
            market={market}
            enabled={isLoaded}
            onClosed={() => invalidateAllUserBorrowDetails({ chainId, marketId, userAddress })}
          />
        ),
      },
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
