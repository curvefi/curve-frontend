import { QuickSwap } from '@/dex/components/PageRouterSwap'
import { useNetworksQuery } from '@/dex/entities/networks'
import { useTokensMapper } from '@/dex/hooks/useTokensMapper'
import { defaultNetworks } from '@/dex/lib/networks'
import { useStore } from '@/dex/store/useStore'
import type { ChainId } from '@/dex/types/main.types'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { createTenderlyWagmiConfigFromVNet } from '@cy/support/helpers/tenderly'
import type { TenderlyWagmiConfigFromVNet } from '@cy/support/helpers/tenderly/vnet'
import Skeleton from '@mui/material/Skeleton'
import type { Address } from '@primitives/address.utils'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { CurveProvider } from '@ui-kit/features/connect-wallet/lib/CurveProvider'

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
  const { tokensMapper, tokensMapperStr } = useTokensMapper(chainId)
  const { isPending } = useNetworksQuery() // `useNetworks` throws while networks are loading
  return isPending ? (
    <Skeleton width="100%" height={400} />
  ) : (
    <QuickSwap
      curve={curveApi}
      pageLoaded={!!(curveApi && tokensMapper[fromAddress] && tokensMapper[toAddress])}
      params={{ network: defaultNetworks[chainId].networkId }}
      searchedParams={{ fromAddress, toAddress }}
      rChainId={chainId}
      tokensMapper={tokensMapper}
      tokensMapperStr={tokensMapperStr}
      redirect={() => {}}
    />
  )
}

export const SwapTestCase = ({ vnet, privateKey, chainId, fromAddress, toAddress }: SwapTestCaseProps) => (
  <ComponentTestWrapper config={createTenderlyWagmiConfigFromVNet({ vnet, privateKey })} autoConnect>
    <CurveProvider
      app="dex"
      network={defaultNetworks[chainId]}
      onChainUnavailable={console.error}
      hydrate={{ dex: useStore((state) => state.hydrate) }}
    >
      <QuickSwapTest chainId={chainId} fromAddress={fromAddress} toAddress={toAddress} />
    </CurveProvider>
  </ComponentTestWrapper>
)
