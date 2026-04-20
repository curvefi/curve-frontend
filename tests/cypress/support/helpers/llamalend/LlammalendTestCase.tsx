import { useMemo } from 'react'
import { prefetchMarkets } from '@/lend/entities/chain/chain-query'
import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import { AddCollateralForm } from '@/llamalend/features/manage-loan/components/AddCollateralForm'
import { BorrowMoreForm } from '@/llamalend/features/manage-loan/components/BorrowMoreForm'
import { RemoveCollateralForm } from '@/llamalend/features/manage-loan/components/RemoveCollateralForm'
import { RepayForm } from '@/llamalend/features/manage-loan/components/RepayForm'
import { ClosePositionForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ClosePositionForm'
import { ImproveHealthForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ImproveHealthForm'
import { ClaimTab } from '@/llamalend/features/supply/components/ClaimTab'
import { DepositForm } from '@/llamalend/features/supply/components/DepositForm'
import { StakeForm } from '@/llamalend/features/supply/components/StakeForm'
import { UnstakeForm } from '@/llamalend/features/supply/components/UnstakeForm'
import { WithdrawForm } from '@/llamalend/features/supply/components/WithdrawForm'
import { getLlamaMarket } from '@/llamalend/llama.utils'
import { useLoanExists } from '@/llamalend/queries/user'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { fakeCollateralEvents } from '@cy/support/helpers/llamalend/mock-loan-test-data'
import { llamaNetworks } from '@cy/support/helpers/llamalend/test-context.helpers'
import { createTenderlyWagmiConfigFromVNet } from '@cy/support/helpers/tenderly'
import { type TenderlyWagmiConfigFromVNet } from '@cy/support/helpers/tenderly/vnet'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import type { Decimal } from '@primitives/decimal.utils'
import { useCurve } from '@ui-kit/features/connect-wallet/lib/CurveContext'
import { CurveProvider } from '@ui-kit/features/connect-wallet/lib/CurveProvider'
import type { UserMarketQuery } from '@ui-kit/lib/model'
import { constQ, type Range } from '@ui-kit/types/util'

// todo: soft liquidation should be detected not forced by passing a tab. However, that detection is in the separate apps for now.
const LoanComponents = {
  'borrow-more': BorrowMoreForm,
  'add-collateral': AddCollateralForm,
  'remove-collateral': RemoveCollateralForm,
  repay: RepayForm,
  'improve-health': ImproveHealthForm,
  close: ClosePositionForm,
}

const SupplyComponents = {
  claim: ClaimTab,
  deposit: DepositForm,
  stake: StakeForm,
  unstake: UnstakeForm,
  withdraw: WithdrawForm,
}

type LoanTab = keyof typeof LoanComponents
type SupplyTab = keyof typeof SupplyComponents

type LlammalendTestProps = {
  type: 'loan' | 'supply'
  tab?: LoanTab | SupplyTab
  onSuccess?: ReturnType<typeof cy.stub>
  onPricesUpdated?: (prices: Range<Decimal> | undefined) => void
} & UserMarketQuery<LlamaChainId>

function LlammalendTest({ tab, onPricesUpdated, type, ...props }: LlammalendTestProps) {
  const { isHydrated } = useCurve()
  const isLoan = type === 'loan'
  const { data: loanExists } = useLoanExists(props, isHydrated && isLoan)
  const marketId = isHydrated && props.marketId
  const market = useMemo(() => marketId && getLlamaMarket(marketId), [marketId])

  if (!market || (loanExists && !tab)) return <Skeleton width="100%" height={400} />

  const Component = isLoan
    ? loanExists
      ? LoanComponents[tab as LoanTab]
      : CreateLoanForm
    : SupplyComponents[(tab ?? 'deposit') as SupplyTab]

  return (
    <Component
      market={market}
      networks={llamaNetworks}
      onPricesUpdated={onPricesUpdated!}
      onSuccess={cy.stub()}
      enabled
      collateralEvents={constQ(fakeCollateralEvents)}
      {...props}
    />
  )
}

export type LlammalendTestCaseProps = LlammalendTestProps & TenderlyWagmiConfigFromVNet

export const LlammalendTestCase = ({ vnet, privateKey, chainId, ...props }: LlammalendTestCaseProps) => (
  <ComponentTestWrapper config={createTenderlyWagmiConfigFromVNet({ vnet, privateKey })} autoConnect>
    <CurveProvider
      app="llamalend"
      network={llamaNetworks[chainId]}
      onChainUnavailable={console.error}
      hydrate={useMemo(() => ({ llamalend: () => prefetchMarkets({ chainId, enableLLv2: true }) }), [chainId])}
    >
      <Box sx={{ maxWidth: 520 }}>
        <LlammalendTest {...props} chainId={chainId} />
      </Box>
    </CurveProvider>
  </ComponentTestWrapper>
)
