import { networks } from '@/lend/networks'
import { AddCollateralForm } from '@/llamalend/features/manage-loan/components/AddCollateralForm'
import { BorrowMoreForm } from '@/llamalend/features/manage-loan/components/BorrowMoreForm'
import { RemoveCollateralForm } from '@/llamalend/features/manage-loan/components/RemoveCollateralForm'
import { RepayForm } from '@/llamalend/features/manage-loan/components/RepayForm'
import { ClosePositionForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ClosePositionForm'
import { ImproveHealthForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ImproveHealthForm'
import { useMarketContext } from '@/llamalend/features/market-context'
import { useLiquidationStatus } from '@/llamalend/features/market-position-details/hooks/useUserLiquidationStatus'
import type { UserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { Decimal } from '@primitives/decimal.utils'
import { useLoanImplementationKey } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import type { QueryProp, Range } from '@ui-kit/types/util'
import { type FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'

type LendManageLoanProps = {
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
  collateralEvents: QueryProp<UserCollateralEvents>
}

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
] satisfies FormTab<LendManageLoanProps>[]

const LendManageSoftLiquidationMenu = [
  {
    value: 'soft-liquidation',
    label: t`Manage soft liquidation`,
    subTabs: [
      {
        value: 'improve-health',
        label: t`Improve health`,
        component: props => <ImproveHealthForm networks={networks} {...props} />,
      },
      {
        value: 'close-position',
        label: t`Close`,
        component: props => <ClosePositionForm networks={networks} {...props} />,
      },
    ],
  },
] satisfies FormTab<LendManageLoanProps>[]

export const ManageLoanTabs = (params: LendManageLoanProps) => {
  const { chainId, marketId, userAddress } = useMarketContext()
  const { data: status } = useLiquidationStatus({ chainId, marketId, userAddress })
  const isSoftLiquidation = ['softLiquidation', 'hardLiquidation'].includes(status ?? '')
  const menu = isSoftLiquidation ? LendManageSoftLiquidationMenu : LendManageMenu
  return <FormTabs key={useLoanImplementationKey()} params={params} menu={menu} />
}
