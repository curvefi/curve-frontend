import { AddCollateralForm } from '@/llamalend/features/manage-loan/components/AddCollateralForm'
import { BorrowMoreForm } from '@/llamalend/features/manage-loan/components/BorrowMoreForm'
import { RemoveCollateralForm } from '@/llamalend/features/manage-loan/components/RemoveCollateralForm'
import { RepayForm } from '@/llamalend/features/manage-loan/components/RepayForm'
import { ClosePositionForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ClosePositionForm'
import { ImproveHealthForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ImproveHealthForm'
import { hasDeleverage } from '@/llamalend/llama.utils'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { CollateralDecrease } from '@/loan/components/PageMintMarket/CollateralDecrease'
import { CollateralIncrease } from '@/loan/components/PageMintMarket/CollateralIncrease'
import { LoanDecrease } from '@/loan/components/PageMintMarket/LoanDecrease'
import { LoanDeleverage } from '@/loan/components/PageMintMarket/LoanDeleverage'
import { LoanIncrease } from '@/loan/components/PageMintMarket/LoanIncrease'
import { LoanLiquidate } from '@/loan/components/PageMintMarket/LoanLiquidate'
import type { ManageLoanProps } from '@/loan/components/PageMintMarket/types'
import { networks } from '@/loan/networks'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useManageLoanMuiForm, useManageSoftLiquidation } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { type FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'

// casting the networks for the loan app so we don't need to make the whole form generic
const softLiqNetworks = networks as unknown as NetworkDict<LlamaChainId>
type MintManageLoanProps = ManageLoanProps & {
  onChartPreviewPricesUpdate: (prices: string[] | undefined) => void
}

const BorrowTab = ({ rChainId, market, isReady, onChartPreviewPricesUpdate }: MintManageLoanProps) => (
  <BorrowMoreForm
    networks={networks}
    chainId={rChainId}
    market={market ?? undefined}
    enabled={isReady}
    onPricesUpdated={onChartPreviewPricesUpdate}
  />
)

const RepayTab = ({ rChainId, market, isReady, onChartPreviewPricesUpdate }: MintManageLoanProps) => (
  <RepayForm
    networks={networks}
    chainId={rChainId}
    market={market ?? undefined}
    enabled={isReady}
    onPricesUpdated={onChartPreviewPricesUpdate}
  />
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
    visible: ({ market }) => !market || hasDeleverage(market),
  },
] satisfies FormTab<MintManageLoanProps>[]

const MintManageNewMenu = [
  {
    value: 'borrow',
    label: t`Borrow`,
    component: BorrowTab,
  },
  {
    value: 'repay',
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
        component: ({ rChainId, market, isReady }: MintManageLoanProps) => (
          <AddCollateralForm networks={networks} chainId={rChainId} market={market ?? undefined} enabled={isReady} />
        ),
      },
      {
        value: 'remove',
        label: t`Remove`,
        component: ({ rChainId, market, isReady }: MintManageLoanProps) => (
          <RemoveCollateralForm networks={networks} chainId={rChainId} market={market ?? undefined} enabled={isReady} />
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
        component: ({ rChainId, market, isReady }: ManageLoanProps) => (
          <ImproveHealthForm
            chainId={rChainId}
            market={market ?? undefined}
            networks={softLiqNetworks}
            enabled={isReady}
          />
        ),
      },
      {
        value: 'close-position',
        label: t`Close position`,
        component: ({ rChainId, market, isReady }: ManageLoanProps) => (
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

export const ManageLoanTabs = ({
  isInSoftLiquidation,
  ...pageProps
}: MintManageLoanProps & { isInSoftLiquidation: boolean }) => {
  const shouldUseSoftLiquidation = useManageSoftLiquidation() && isInSoftLiquidation
  const shouldUseManageLoanMuiForm = useManageLoanMuiForm()
  const menu = shouldUseSoftLiquidation
    ? MintManageSoftLiquidationMenu
    : shouldUseManageLoanMuiForm
      ? MintManageNewMenu
      : MintManageLegacyMenu
  return <FormTabs params={pageProps} menu={menu} shouldWrap={menu === MintManageLegacyMenu} />
}
