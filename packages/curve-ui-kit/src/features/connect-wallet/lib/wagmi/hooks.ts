import { useMemo } from 'react'
import { useConfig } from 'wagmi'
export {
  useBalance,
  useChainId,
  useConfig,
  useConnect,
  useConnection as useAccount,
  useConnectorClient,
  useConnectors,
  useDisconnect,
  useEnsName,
  useReadContract,
  useReadContracts,
  useSimulateContract,
  useSwitchChain,
  useWriteContract,
} from 'wagmi'

export function useChainConfig(chainId: number | null | undefined) {
  const config = useConfig()
  return useMemo(() => config.chains.find((chain) => chain.id === chainId), [config.chains, chainId])
}
