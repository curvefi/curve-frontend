import { AddCollateralForm } from '@/llamalend/features/manage-loan/components/AddCollateralForm'
import { RemoveCollateralForm } from '@/llamalend/features/manage-loan/components/RemoveCollateralForm'
import { RepayForm } from '@/llamalend/features/manage-loan/components/RepayForm'
import { useClosePositionTab } from '@/llamalend/features/manage-soft-liquidation/hooks/useClosePositionTab'
import { useImproveHealthTab } from '@/llamalend/features/manage-soft-liquidation/hooks/useImproveHealthTab'
import { ClosePosition } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ClosePosition'
import { ImproveHealth } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ImproveHealth'
import { CollateralDecrease } from '@/loan/components/PageMintMarket/CollateralDecrease'
import { CollateralIncrease } from '@/loan/components/PageMintMarket/CollateralIncrease'
import { LoanDecrease } from '@/loan/components/PageMintMarket/LoanDecrease'
import { LoanDeleverage } from '@/loan/components/PageMintMarket/LoanDeleverage'
import { LoanIncreaseWrapped, LoanIncrease } from '@/loan/components/PageMintMarket/LoanIncrease'
import { LoanLiquidate } from '@/loan/components/PageMintMarket/LoanLiquidate'
import type { ManageLoanProps } from '@/loan/components/PageMintMarket/types'
import { networks } from '@/loan/networks'
import { hasDeleverage, hasV1Leverage } from '@/loan/utils/leverage'
import { useManageLoanMuiForm, useManageSoftLiquidation } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { type FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'

const ImproveHealthTab = ({ rChainId, market }: ManageLoanProps) => (
  <ImproveHealth
    {...useImproveHealthTab({ chainId: rChainId, network: networks[rChainId], marketId: market?.id ?? '' })}
  />
)

const ClosePositionTab = ({ rChainId, market }: ManageLoanProps) => (
  <ClosePosition
    {...useClosePositionTab({ chainId: rChainId, network: networks[rChainId], marketId: market?.id ?? '' })}
  />
)

const LoanRepayTab = ({ rChainId, market, isReady }: ManageLoanProps) => (
  <RepayForm networks={networks} chainId={rChainId} market={market ?? undefined} enabled={isReady} />
)

const LoanAddCollateralTab = ({ rChainId, market, isReady }: ManageLoanProps) => (
  <AddCollateralForm networks={networks} chainId={rChainId} market={market ?? undefined} enabled={isReady} />
)

const LoanRemoveCollateralTab = ({ rChainId, market, isReady }: ManageLoanProps) => (
  <RemoveCollateralForm networks={networks} chainId={rChainId} market={market ?? undefined} enabled={isReady} />
)

const MintManageLegacyMenu = [
  {
    value: 'loan' as const,
    label: t`Loan`,
    subTabs: [
      { value: 'loan-increase', label: t`Borrow more`, component: LoanIncrease },
      { value: 'loan-decrease', label: t`Repay`, component: LoanDecrease },
      { value: 'loan-liquidate', label: t`Self-liquidate`, component: LoanLiquidate },
    ],
  },
  {
    value: 'collateral' as const,
    label: t`Collateral`,
    subTabs: [
      { value: 'collateral-increase', label: t`Add`, component: CollateralIncrease },
      { value: 'collateral-decrease', label: t`Remove`, component: CollateralDecrease },
    ],
  },
  {
    value: 'deleverage' as const,
    label: t`Delever`,
    component: LoanDeleverage,
    visible: ({ market }) => hasDeleverage(market),
  },
] satisfies FormTab<ManageLoanProps>[]

const MintManageNewMenu = [
  {
    value: 'borrow',
    label: ({ market }) => (hasV1Leverage(market) ? t`Leverage` : t`Borrow`),
    component: LoanIncreaseWrapped,
  },
  {
    value: 'repay',
    label: t`Repay`,
    component: LoanRepayTab,
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

const MintManageSoftLiquidationMenu = [
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
  const shouldUseSoftLiquidation = useManageSoftLiquidation() && isInSoftLiquidation
  const shouldUseManageLoanMuiForm = useManageLoanMuiForm()
  const menu = shouldUseSoftLiquidation
    ? MintManageSoftLiquidationMenu
    : shouldUseManageLoanMuiForm
      ? MintManageNewMenu
      : MintManageLegacyMenu
  return <FormTabs params={pageProps} menu={menu} shouldWrap={menu == MintManageLegacyMenu} />
}
