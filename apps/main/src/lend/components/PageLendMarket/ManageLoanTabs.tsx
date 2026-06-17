import { networks } from '@/lend/networks'
import { type MarketUrlParams, PageContentProps } from '@/lend/types/lend.types'
import { AddCollateralForm } from '@/llamalend/features/manage-loan/components/AddCollateralForm'
import { BorrowMoreForm } from '@/llamalend/features/manage-loan/components/BorrowMoreForm'
import { RemoveCollateralForm } from '@/llamalend/features/manage-loan/components/RemoveCollateralForm'
import { RepayForm } from '@/llamalend/features/manage-loan/components/RepayForm'
import { ClosePositionForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ClosePositionForm'
import { ImproveHealthForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ImproveHealthForm'
import { useLiquidationStatus } from '@/llamalend/features/market-position-details/hooks/useUserLiquidationStatus'
import type { UserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { Decimal } from '@primitives/decimal.utils'
import { useLoanImplementationKey } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import type { QueryProp, Range } from '@ui-kit/types/util'
import { type FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'

type ManageLoanProps = PageContentProps<MarketUrlParams> & {
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
  collateralEvents: QueryProp<UserCollateralEvents>
}

const LendManageMenu = [
  {
    value: 'loan-increase',
    label: t`Borrow`,
    component: ({ chainId: chainId, marketQuery: { data: market }, ...props }: ManageLoanProps) => (
      <BorrowMoreForm chainId={chainId} networks={networks} market={market} {...props} />
    ),
  },
  {
    value: 'loan-decrease',
    label: t`Repay`,
    component: ({ chainId: chainId, marketQuery: { data: market }, ...props }: ManageLoanProps) => (
      <RepayForm chainId={chainId} networks={networks} market={market} {...props} />
    ),
  },
  {
    value: 'collateral',
    label: t`Collateral`,
    subTabs: [
      {
        value: 'add',
        label: t`Add`,
        component: ({ chainId: chainId, marketQuery: { data: market }, ...props }: ManageLoanProps) => (
          <AddCollateralForm networks={networks} chainId={chainId} market={market} {...props} />
        ),
      },
      {
        value: 'remove',
        label: t`Remove`,
        component: ({ chainId: chainId, marketQuery: { data: market }, ...props }: ManageLoanProps) => (
          <RemoveCollateralForm networks={networks} chainId={chainId} market={market} {...props} />
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
        component: ({ chainId: chainId, marketQuery: { data: market }, ...props }: ManageLoanProps) => (
          <ImproveHealthForm chainId={chainId} networks={networks} market={market} {...props} />
        ),
      },
      {
        value: 'close-position',
        label: t`Close`,
        component: ({ chainId: chainId, marketQuery: { data: market } }: ManageLoanProps) => (
          <ClosePositionForm chainId={chainId} networks={networks} market={market} />
        ),
      },
    ],
  },
] satisfies FormTab<ManageLoanProps>[]

export const ManageLoanTabs = (params: ManageLoanProps) => {
  const { data: status } = useLiquidationStatus({
    chainId: params.chainId,
    marketId: params.marketId,
    userAddress: params.userAddress,
  })
  const isSoftLiquidation = ['softLiquidation', 'hardLiquidation'].includes(status ?? '')
  const menu = isSoftLiquidation ? LendManageSoftLiquidationMenu : LendManageMenu
  return <FormTabs key={useLoanImplementationKey()} params={params} menu={menu} />
}
