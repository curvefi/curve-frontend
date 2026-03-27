import { useMemo } from 'react'
import { prefetchMarkets } from '@/lend/entities/chain/chain-query'
import { ClaimTab } from '@/llamalend/features/supply/components/ClaimTab'
import { DepositForm } from '@/llamalend/features/supply/components/DepositForm'
import { StakeForm } from '@/llamalend/features/supply/components/StakeForm'
import { UnstakeForm } from '@/llamalend/features/supply/components/UnstakeForm'
import { WithdrawForm } from '@/llamalend/features/supply/components/WithdrawForm'
import { getLlamaMarket } from '@/llamalend/llama.utils'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { networks as loanNetworks } from '@/loan/networks'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { createTenderlyWagmiConfigFromVNet } from '@cy/support/helpers/tenderly'
import { type TenderlyWagmiConfigFromVNet } from '@cy/support/helpers/tenderly/vnet'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { useCurve } from '@ui-kit/features/connect-wallet/lib/CurveContext'
import { CurveProvider } from '@ui-kit/features/connect-wallet/lib/CurveProvider'
import type { UserMarketQuery } from '@ui-kit/lib/model'

const networks = loanNetworks as unknown as NetworkDict<LlamaChainId>

const prefetch = () => prefetchMarkets({})

const Components = {
  claim: ClaimTab,
  deposit: DepositForm,
  stake: StakeForm,
  unstake: UnstakeForm,
  withdraw: WithdrawForm,
}

type SupplyTab = keyof typeof Components

type SupplyFlowTestProps = {
  tab?: SupplyTab
  onSuccess: ReturnType<typeof cy.stub>
} & UserMarketQuery<LlamaChainId>

function LlamalendSupplyTest({ tab = 'deposit', ...props }: SupplyFlowTestProps) {
  const marketId = useCurve().isHydrated && props.marketId
  const market = useMemo(() => marketId && getLlamaMarket(marketId), [marketId])

  if (!market) return <Skeleton width="100%" height={400} />

  const Component = Components[tab]
  return <Component market={market} networks={networks} enabled {...props} />
}

export type LlamalendSupplyTestCaseProps = SupplyFlowTestProps & TenderlyWagmiConfigFromVNet

export const LlamalendSupplyTestCase = ({ vnet, privateKey, ...props }: LlamalendSupplyTestCaseProps) => (
  <ComponentTestWrapper config={createTenderlyWagmiConfigFromVNet({ vnet, privateKey })} autoConnect>
    <CurveProvider
      app="llamalend"
      network={networks[props.chainId]}
      onChainUnavailable={console.error}
      hydrate={{ llamalend: prefetch }}
    >
      <Box sx={{ maxWidth: 520 }}>
        <LlamalendSupplyTest {...props} />
      </Box>
    </CurveProvider>
  </ComponentTestWrapper>
)
