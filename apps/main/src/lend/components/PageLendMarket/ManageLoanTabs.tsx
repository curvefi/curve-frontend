import { networks } from '@/lend/networks'
import { AddCollateralForm } from '@/llamalend/features/manage-loan/components/AddCollateralForm'
import { BorrowMoreForm } from '@/llamalend/features/manage-loan/components/BorrowMoreForm'
import { RemoveCollateralForm } from '@/llamalend/features/manage-loan/components/RemoveCollateralForm'
import { RepayForm } from '@/llamalend/features/manage-loan/components/RepayForm'
import { ClosePositionForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ClosePositionForm'
import { ImproveHealthForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ImproveHealthForm'
import { ResetPositionForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ResetPositionForm'
import type { UserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { Decimal } from '@primitives/decimal.utils'
import { useLoanImplementationKey } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { type QueryProp, type Range } from '@ui-kit/types/util'
import { type FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'

type LendManageLoanProps = {
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
  collateralEvents: QueryProp<UserCollateralEvents>
  showReset: boolean
  isSoftLiquidation: boolean
}

type LendManageLoanTab = FormTab<LendManageLoanProps>
type LendManageLoanSubTab = NonNullable<LendManageLoanTab['subTabs']>[number]

const LendManageMenu = [
  { value: 'loan-increase', label: t`Borrow`, component: props => <BorrowMoreForm networks={networks} {...props} /> },
  { value: 'loan-decrease', label: t`Repay`, component: props => <RepayForm networks={networks} {...props} /> },
  {
    value: 'collateral',
    label: t`Collateral`,
    subTabs: [
      { value: 'add', label: t`Add`, component: props => <AddCollateralForm networks={networks} {...props} /> },
      {
        value: 'remove',
        label: t`Remove`,
        component: props => <RemoveCollateralForm networks={networks} {...props} />,
      },
    ],
  },
] satisfies LendManageLoanTab[]

const SoftLiquidationMenu = [
  {
    value: 'soft-liquidation',
    label: t`Manage soft liquidation`,
    subTabs: [
      {
        value: 'reset',
        label: t`Reset`,
        visible: p => p.showReset,
        component: props => <ResetPositionForm networks={networks} {...props} />,
      },
      {
        value: 'close-position',
        label: t`Close`,
        component: props => <ClosePositionForm networks={networks} {...props} />,
      } satisfies LendManageLoanSubTab,
      {
        value: 'improve-health',
        label: t`Improve health`,
        component: props => <ImproveHealthForm networks={networks} {...props} />,
      } satisfies LendManageLoanSubTab,
    ],
  },
] satisfies LendManageLoanTab[]

export const ManageLoanTabs = (params: LendManageLoanProps) => (
  <FormTabs
    key={useLoanImplementationKey()}
    params={params}
    menu={params.isSoftLiquidation ? SoftLiquidationMenu : LendManageMenu}
  />
)
