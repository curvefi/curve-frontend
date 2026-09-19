import { noop } from 'lodash'
import { QuickSwap } from '@/dex/components/PageRouterSwap'
import { useNetworksQuery } from '@/dex/entities/networks'
import { defaultNetworks } from '@/dex/lib/networks'
import { useToken } from '@/dex/queries/tokens.query'
import { useStore } from '@/dex/store/useStore'
import type { ChainId } from '@/dex/types/main.types'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { createTenderlyWagmiConfigFromVNet } from '@cy/support/helpers/tenderly'
import type { TenderlyWagmiConfigFromVNet } from '@cy/support/helpers/tenderly/vnet'
import { useCurve } from '@evm-ui/features/connect-wallet'
import { CurveProvider } from '@evm-ui/features/connect-wallet/lib/CurveProvider'
import type { Address } from '@primitives/address.utils'
import { Loading } from '@ui/components/Loading'

export type SwapTestCaseProps = {
  chainId: ChainId
  fromAddress: Address
  toAddress: Address
} & TenderlyWagmiConfigFromVNet

function QuickSwapTest({
  chainId,
  fromAddress,
  toAddress,
}: {
  chainId: ChainId
  fromAddress: Address
  toAddress: Address
}) {
  const { curveApi = null } = useCurve()
  const { data: fromToken } = useToken({ chainId, tokenAddress: fromAddress })
  const { data: toToken } = useToken({ chainId, tokenAddress: toAddress })
  const { isPending } = useNetworksQuery() // `useNetworks` throws while networks are loading
  return isPending ? (
    <Loading />
  ) : (
    <QuickSwap
      curve={curveApi}
      pageLoaded={!!(curveApi && fromToken && toToken)}
      params={{ network: defaultNetworks[chainId].blockchainId }}
      searchedParams={{ fromAddress, toAddress }}
      rChainId={chainId}
      redirect={noop}
    />
  )
}

export const SwapTestCase = ({ vnet, privateKey, chainId, fromAddress, toAddress }: SwapTestCaseProps) => (
  <ComponentTestWrapper config={createTenderlyWagmiConfigFromVNet({ vnet, privateKey })} autoConnect>
    <CurveProvider
      app="dex"
      network={defaultNetworks[chainId]}
      onChainUnavailable={console.error}
      hydrate={{ dex: useStore(state => state.hydrate) }}
    >
      <QuickSwapTest chainId={chainId} fromAddress={fromAddress} toAddress={toAddress} />
    </CurveProvider>
  </ComponentTestWrapper>
)
