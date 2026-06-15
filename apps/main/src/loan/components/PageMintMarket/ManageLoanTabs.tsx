import { AddCollateralForm } from '@/llamalend/features/manage-loan/components/AddCollateralForm'
import { BorrowMoreForm } from '@/llamalend/features/manage-loan/components/BorrowMoreForm'
import { RemoveCollateralForm } from '@/llamalend/features/manage-loan/components/RemoveCollateralForm'
import { RepayForm } from '@/llamalend/features/manage-loan/components/RepayForm'
import { ClosePositionForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ClosePositionForm'
import { ImproveHealthForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ImproveHealthForm'
import { useLiquidationStatus } from '@/llamalend/features/market-position-details/hooks/useUserLiquidationStatus'
import type { UserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import type { LoanTabProps } from '@/loan/components/PageMintMarket/types'
import { networks } from '@/loan/networks'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useLoanImplementationKey } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import type { QueryProp } from '@ui-kit/types/util'
import { type FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'

// casting the networks for the loan app so we don't need to make the whole form generic
const softLiqNetworks = networks as unknown as NetworkDict<LlamaChainId>
type MintManageLoanProps = LoanTabProps & { collateralEvents: QueryProp<UserCollateralEvents> }

const MintManageMenu = [
  {
    value: 'borrow',
    label: t`Borrow`,
    component: ({ rChainId, ...props }: MintManageLoanProps) => (
      <BorrowMoreForm networks={networks} chainId={rChainId} {...props} />
    ),
  },
  {
    value: 'repay',
    label: t`Repay`,
    component: ({ rChainId, ...props }: MintManageLoanProps) => (
      <RepayForm networks={networks} chainId={rChainId} {...props} />
    ),
  },
  {
    value: 'collateral',
    label: t`Collateral`,
    subTabs: [
      {
        value: 'add',
        label: t`Add`,
        component: ({ rChainId, ...props }: MintManageLoanProps) => (
          <AddCollateralForm networks={networks} chainId={rChainId} {...props} />
        ),
      },
      {
        value: 'remove',
        label: t`Remove`,
        component: ({ rChainId, ...props }: MintManageLoanProps) => (
          <RemoveCollateralForm networks={networks} chainId={rChainId} {...props} />
        ),
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
        component: ({ rChainId, ...props }: MintManageLoanProps) => (
          <ImproveHealthForm chainId={rChainId} networks={softLiqNetworks} {...props} isInSoftLiquidation />
        ),
      },
      {
        value: 'close-position',
        label: t`Close`,
        component: ({ rChainId, market }: MintManageLoanProps) => (
          <ClosePositionForm chainId={rChainId} market={market} networks={softLiqNetworks} />
        ),
      },
    ],
  },
] satisfies FormTab<MintManageLoanProps>[]

export const ManageLoanTabs = (params: MintManageLoanProps) => {
  const { market, curve, rChainId } = params
  const { data: status } = useLiquidationStatus({
    chainId: rChainId,
    marketId: market?.id,
    userAddress: curve?.signerAddress,
  })
  const isSoftLiquidation = ['softLiquidation', 'hardLiquidation'].includes(status ?? '')
  const menu = isSoftLiquidation ? MintManageSoftLiquidationMenu : MintManageMenu
  return <FormTabs key={useLoanImplementationKey()} params={params} menu={menu} />
}
