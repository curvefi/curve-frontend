import { AddCollateralForm } from '@/llamalend/features/manage-loan/components/AddCollateralForm'
import { BorrowMoreForm } from '@/llamalend/features/manage-loan/components/BorrowMoreForm'
import { RemoveCollateralForm } from '@/llamalend/features/manage-loan/components/RemoveCollateralForm'
import { RepayForm } from '@/llamalend/features/manage-loan/components/RepayForm'
import { ClosePositionForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ClosePositionForm'
import { ImproveHealthForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ImproveHealthForm'
import { useMarketContext } from '@/llamalend/features/market-context'
import { useLiquidationStatus } from '@/llamalend/features/market-position-details/hooks/useUserLiquidationStatus'
import type { UserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { networks } from '@/loan/networks'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Decimal } from '@primitives/decimal.utils'
import { useLoanImplementationKey } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import type { QueryProp, Range } from '@ui-kit/types/util'
import { type FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'

// casting the networks for the loan app so we don't need to make the whole form generic
const softLiqNetworks = networks as unknown as NetworkDict<LlamaChainId>

type MintManageLoanProps = {
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
  collateralEvents: QueryProp<UserCollateralEvents>
}

const MintManageMenu = [
  {
    value: 'borrow',
    label: t`Borrow`,
    component: props => <BorrowMoreForm networks={networks} {...props} />,
  },
  {
    value: 'repay',
    label: t`Repay`,
    component: props => <RepayForm networks={networks} {...props} />,
  },
  {
    value: 'collateral',
    label: t`Collateral`,
    subTabs: [
      {
        value: 'add',
        label: t`Add`,
        component: props => <AddCollateralForm networks={networks} {...props} />,
      },
      {
        value: 'remove',
        label: t`Remove`,
        component: props => <RemoveCollateralForm networks={networks} {...props} />,
      },
    ],
  },
] satisfies FormTab<MintManageLoanProps>[]

const MintManageSoftLiquidationMenu = [
  {
    value: 'soft-liquidation',
    label: t`Manage soft liquidation`,
    subTabs: [
      {
        value: 'improve-health',
        label: t`Improve health`,
        component: props => <ImproveHealthForm networks={softLiqNetworks} {...props} isInSoftLiquidation />,
      },
      {
        value: 'close-position',
        label: t`Close`,
        component: props => <ClosePositionForm networks={softLiqNetworks} {...props} />,
      },
    ],
  },
] satisfies FormTab<MintManageLoanProps>[]

export const ManageLoanTabs = (params: MintManageLoanProps) => {
  const { marketId, userAddress, chainId } = useMarketContext()
  const { data: status } = useLiquidationStatus({
    chainId,
    marketId,
    userAddress,
  })
  const isSoftLiquidation = ['softLiquidation', 'hardLiquidation'].includes(status ?? '')
  const menu = isSoftLiquidation ? MintManageSoftLiquidationMenu : MintManageMenu
  return <FormTabs key={useLoanImplementationKey()} withMobileDrawer params={params} menu={menu} />
}
