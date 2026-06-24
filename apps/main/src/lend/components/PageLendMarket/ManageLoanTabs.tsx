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
import { LlamaMarketType } from '@ui-kit/types/market'
import type { QueryProp, Range } from '@ui-kit/types/util'
import { type FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'

const { Lend } = LlamaMarketType

export type LendManageLoanProps = PageContentProps<MarketUrlParams> & {
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
  collateralEvents: QueryProp<UserCollateralEvents>
}

const LendManageMenu = [
  {
    value: 'loan-increase',
    label: t`Borrow`,
    component: ({ rChainId: chainId, ...props }: LendManageLoanProps) => (
      <BorrowMoreForm chainId={chainId} networks={networks} marketType={Lend} {...props} />
    ),
  },
  {
    value: 'loan-decrease',
    label: t`Repay`,
    component: ({ rChainId: chainId, ...props }: LendManageLoanProps) => (
      <RepayForm chainId={chainId} networks={networks} marketType={Lend} {...props} />
    ),
  },
  {
    value: 'collateral',
    label: t`Collateral`,
    subTabs: [
      {
        value: 'add',
        label: t`Add`,
        component: ({ rChainId: chainId, ...props }: LendManageLoanProps) => (
          <AddCollateralForm networks={networks} chainId={chainId} marketType={Lend} {...props} />
        ),
      },
      {
        value: 'remove',
        label: t`Remove`,
        component: ({ rChainId: chainId, ...props }: LendManageLoanProps) => (
          <RemoveCollateralForm networks={networks} chainId={chainId} marketType={Lend} {...props} />
        ),
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
        component: ({ rChainId: chainId, ...props }: LendManageLoanProps) => (
          <ImproveHealthForm chainId={chainId} networks={networks} marketType={Lend} {...props} />
        ),
      },
      {
        value: 'close-position',
        label: t`Close`,
        component: ({ rChainId: chainId, market }: LendManageLoanProps) => (
          <ClosePositionForm chainId={chainId} networks={networks} market={market} />
        ),
      },
    ],
  },
] satisfies FormTab<LendManageLoanProps>[]

export const ManageLoanTabs = (params: LendManageLoanProps) => {
  const { data: status } = useLiquidationStatus({
    chainId: params.rChainId,
    marketId: params.market?.id,
    userAddress: params.userAddress,
  })
  const isSoftLiquidation = ['softLiquidation', 'hardLiquidation'].includes(status ?? '')
  const menu = isSoftLiquidation ? LendManageSoftLiquidationMenu : LendManageMenu
  return <FormTabs key={useLoanImplementationKey()} params={params} menu={menu} />
}
