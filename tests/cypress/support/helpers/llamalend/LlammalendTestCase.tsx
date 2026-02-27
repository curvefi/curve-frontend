import { useMemo } from 'react'
import { prefetchMarkets } from '@/lend/entities/chain/chain-query'
import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import { BorrowMoreForm } from '@/llamalend/features/manage-loan/components/BorrowMoreForm'
import { RepayForm } from '@/llamalend/features/manage-loan/components/RepayForm'
import { ClosePositionForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ClosePositionForm'
import { ImproveHealthForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ImproveHealthForm'
import { getLlamaMarket } from '@/llamalend/llama.utils'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useLoanExists } from '@/llamalend/queries/user'
import { networks as loanNetworks } from '@/loan/networks'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { createTenderlyWagmiConfigFromVNet } from '@cy/support/helpers/tenderly'
import { type TenderlyWagmiConfigFromVNet } from '@cy/support/helpers/tenderly/vnet'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import type { Decimal } from '@primitives/decimal.utils'
import { useCurve } from '@ui-kit/features/connect-wallet/lib/CurveContext'
import { CurveProvider } from '@ui-kit/features/connect-wallet/lib/CurveProvider'
import type { UserMarketQuery } from '@ui-kit/lib/model'
import type { Range } from '@ui-kit/types/util'

const networks = loanNetworks as unknown as NetworkDict<LlamaChainId>

const prefetch = () => prefetchMarkets({})

// todo: soft liquidation should be detected not forced by passing a tab. However, that detection is in the separate apps for now.
const Components = {
  'borrow-more': BorrowMoreForm,
  repay: RepayForm,
  'improve-health': ImproveHealthForm,
  close: ClosePositionForm,
}

type LoanTab = keyof typeof Components

type LoanFlowTestProps = {
  tab?: LoanTab
  onSuccess: ReturnType<typeof cy.stub>
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
} & UserMarketQuery<LlamaChainId>

function LlammalendTest({ tab, ...props }: LoanFlowTestProps) {
  const { data: loanExists } = useLoanExists(props)
  const marketId = useCurve().isHydrated && props.marketId
  const market = useMemo(() => marketId && getLlamaMarket(marketId), [marketId])

  if (!market || (loanExists && !tab)) return <Skeleton width="100%" height={400} />

  const Component = loanExists ? Components[tab!] : CreateLoanForm
  return <Component market={market} networks={networks} {...props} />
}

export type LlammalendTestCaseProps = LoanFlowTestProps & TenderlyWagmiConfigFromVNet

export const LlammalendTestCase = ({ vnet, privateKey, ...props }: LlammalendTestCaseProps) => (
  <ComponentTestWrapper config={createTenderlyWagmiConfigFromVNet({ vnet, privateKey })} autoConnect>
    <CurveProvider
      app="llamalend"
      network={networks[props.chainId]}
      onChainUnavailable={console.error}
      hydrate={{ llamalend: prefetch }}
    >
      <Box sx={{ maxWidth: 520 }}>
        <LlammalendTest {...props} />
      </Box>
    </CurveProvider>
  </ComponentTestWrapper>
)
