import { AddCollateralForm } from '@/llamalend/features/manage-loan/components/AddCollateralForm'
import { BorrowMoreForm } from '@/llamalend/features/manage-loan/components/BorrowMoreForm'
import { RemoveCollateralForm } from '@/llamalend/features/manage-loan/components/RemoveCollateralForm'
import { RepayForm } from '@/llamalend/features/manage-loan/components/RepayForm'
import { ClosePositionForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ClosePositionForm'
import { ImproveHealthForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ImproveHealthForm'
import { useLiquidationStatus } from '@/llamalend/features/market-position-details/hooks/useUserLiquidationStatus'
import type { UserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import type { ManageLoanProps } from '@/loan/components/PageMintMarket/types'
import { networks } from '@/loan/networks'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Decimal } from '@primitives/decimal.utils'
import { useLoanImplementationKey } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import type { QueryProp, Range } from '@ui-kit/types/util'
import { type FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'

// casting the networks for the loan app so we don't need to make the whole form generic
const softLiqNetworks = networks as unknown as NetworkDict<LlamaChainId>
type MintManageLoanProps = ManageLoanProps & {
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
  collateralEvents: QueryProp<UserCollateralEvents>
}

const MintManageMenu = [
  {
    value: 'borrow',
    label: t`Borrow`,
    component: ({ rChainId, market, isReady, onPricesUpdated, collateralEvents }: MintManageLoanProps) => (
      <BorrowMoreForm
        networks={networks}
        chainId={rChainId}
        market={market ?? undefined}
        enabled={isReady}
        onPricesUpdated={onPricesUpdated}
        collateralEvents={collateralEvents}
      />
    ),
  },
  {
    value: 'repay',
    label: t`Repay`,
    component: ({ rChainId, market, isReady, onPricesUpdated, collateralEvents }: MintManageLoanProps) => (
      <RepayForm
        networks={networks}
        chainId={rChainId}
        market={market ?? undefined}
        enabled={isReady}
        onPricesUpdated={onPricesUpdated}
        collateralEvents={collateralEvents}
      />
    ),
  },
  {
    value: 'collateral',
    label: t`Collateral`,
    subTabs: [
      {
        value: 'add',
        label: t`Add`,
        component: ({ rChainId, market, isReady, onPricesUpdated }: MintManageLoanProps) => (
          <AddCollateralForm
            networks={networks}
            chainId={rChainId}
            market={market ?? undefined}
            enabled={isReady}
            onPricesUpdated={onPricesUpdated}
          />
        ),
      },
      {
        value: 'remove',
        label: t`Remove`,
        component: ({ rChainId, market, isReady, onPricesUpdated }: MintManageLoanProps) => (
          <RemoveCollateralForm
            networks={networks}
            chainId={rChainId}
            market={market ?? undefined}
            enabled={isReady}
            onPricesUpdated={onPricesUpdated}
          />
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
        component: ({ rChainId, market, isReady, collateralEvents }: MintManageLoanProps) => (
          <ImproveHealthForm
            chainId={rChainId}
            market={market ?? undefined}
            networks={softLiqNetworks}
            enabled={isReady}
            collateralEvents={collateralEvents}
            isInSoftLiquidation
          />
        ),
      },
      {
        value: 'close-position',
        label: t`Close`,
        component: ({ rChainId, market, isReady }: MintManageLoanProps) => (
          <ClosePositionForm
            chainId={rChainId}
            market={market ?? undefined}
            networks={softLiqNetworks}
            enabled={isReady}
          />
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
