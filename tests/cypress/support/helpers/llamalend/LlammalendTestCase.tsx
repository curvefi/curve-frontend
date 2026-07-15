import { noop } from 'lodash'
import { MarketContextProvider } from 'main/src/llamalend/features/market-context/MarketContextProvider'
import { useLendMarket } from '@/lend/hooks/useLendMarket'
import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import { AddCollateralForm } from '@/llamalend/features/manage-loan/components/AddCollateralForm'
import { BorrowMoreForm } from '@/llamalend/features/manage-loan/components/BorrowMoreForm'
import { RemoveCollateralForm } from '@/llamalend/features/manage-loan/components/RemoveCollateralForm'
import { RepayForm } from '@/llamalend/features/manage-loan/components/RepayForm'
import { ClosePositionForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ClosePositionForm'
import { ImproveHealthForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ImproveHealthForm'
import { ResetPositionForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ResetPositionForm'
import { ClaimTab } from '@/llamalend/features/supply/components/ClaimTab'
import { DepositForm } from '@/llamalend/features/supply/components/DepositForm'
import { StakeForm } from '@/llamalend/features/supply/components/StakeForm'
import { UnstakeForm } from '@/llamalend/features/supply/components/UnstakeForm'
import { WithdrawForm } from '@/llamalend/features/supply/components/WithdrawForm'
import { useLoanExists } from '@/llamalend/queries/user'
import { useMintMarket } from '@/loan/hooks/useMintMarket'
import { ChainId as MintChain } from '@/loan/types/loan.types'
import { Loading } from '@/routes/Loading'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { fakeCollateralEvents } from '@cy/support/helpers/llamalend/mock-loan-test-data'
import { llamaNetworks } from '@cy/support/helpers/llamalend/test-context.helpers'
import { createTenderlyWagmiConfigFromVNet } from '@cy/support/helpers/tenderly'
import { type TenderlyWagmiConfigFromVNet } from '@cy/support/helpers/tenderly/vnet'
import Box from '@mui/material/Box'
import type { Decimal } from '@primitives/decimal.utils'
import { CurveProvider } from '@ui-kit/features/connect-wallet/lib/CurveProvider'
import type { UserMarketQuery } from '@ui-kit/lib/model'
import { MarketType } from '@ui-kit/types/market'
import { constQ, type Range } from '@ui-kit/types/util'
import { FormPlacementProvider } from '@ui-kit/widgets/DetailPageLayout/form-context/FormPlacementProvider'

// todo: soft liquidation should be detected not forced by passing a tab. However, that detection is in the separate apps for now.
const LoanComponentMap = {
  'borrow-more': BorrowMoreForm,
  'add-collateral': AddCollateralForm,
  'remove-collateral': RemoveCollateralForm,
  repay: RepayForm,
  reset: ResetPositionForm,
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

type LoanTab = keyof typeof LoanComponentMap
type SupplyTab = keyof typeof SupplyComponents

type LlammalendTestProps = UserMarketQuery<LlamaChainId> & {
  type: 'loan' | 'supply'
  tab?: LoanTab | SupplyTab
  onPricesUpdated?: (prices: Range<Decimal> | undefined) => void
  marketType: MarketType
}

function LlammalendTest({ tab, onPricesUpdated, type, marketType, ...props }: LlammalendTestProps) {
  const isLoan = type === 'loan'
  const { marketId, chainId } = props
  const { data: lendMarket, error: lendError } = useLendMarket(
    { chainId, rMarket: marketId },
    marketType === MarketType.Lend,
  )
  const { data: mintMarket, error: mintError } = useMintMarket(
    { chainId: chainId as MintChain, rMarket: marketId },
    marketType === MarketType.Mint,
  )
  const market = lendMarket ?? mintMarket
  const error = lendError ?? mintError
  const { data: loanExists } = useLoanExists(props, isLoan && !!market)

  const Component = isLoan
    ? loanExists
      ? tab && LoanComponentMap[tab as LoanTab]
      : CreateLoanForm
    : tab && SupplyComponents[tab as SupplyTab]

  return market && Component ? (
    <MarketContextProvider
      network={llamaNetworks[chainId]}
      marketQuery={constQ(market)}
      apiMarket={constQ(undefined)}
      marketType={marketType}
    >
      <Component
        networks={llamaNetworks}
        onPricesUpdated={onPricesUpdated ?? noop}
        collateralEvents={constQ(fakeCollateralEvents)}
      />
    </MarketContextProvider>
  ) : market ? (
    `Invalid arguments given to LlammalendTestCase: ${JSON.stringify({ tab, type, loanExists, marketType })}.`
  ) : error ? (
    `Error retrieving market: ${error.message}`
  ) : (
    <Loading />
  )
}

export type LlammalendTestCaseProps = LlammalendTestProps & TenderlyWagmiConfigFromVNet

export const LlammalendTestCase = ({ vnet, privateKey, chainId, marketType, ...props }: LlammalendTestCaseProps) => (
  <ComponentTestWrapper config={createTenderlyWagmiConfigFromVNet({ vnet, privateKey })} autoConnect>
    <CurveProvider app="llamalend" network={llamaNetworks[chainId]} onChainUnavailable={console.error}>
      <Box sx={{ maxWidth: 520 }}>
        <FormPlacementProvider placement="inline">
          <LlammalendTest {...props} chainId={chainId} marketType={marketType} />
        </FormPlacementProvider>
      </Box>
    </CurveProvider>
  </ComponentTestWrapper>
)
