import { Contract, Interface, JsonRpcProvider } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { networks } from '@/lend/networks'
import { ChainId, Provider } from '@/lend/types/lend.types'
import { useWallet } from '@ui-kit/features/connect-wallet'

export const useAbiGaugeTotalSupply = (
  rChainId: ChainId,
  signerRequired: boolean,
  jsonModuleName: string,
  contractAddress: string | undefined,
) => {
  const { provider: walletProvider } = useWallet()

  const [contract, setContract] = useState<Contract | null>(null)

  const getContract = useCallback(
    async (jsonModuleName: string, contractAddress: string, provider: Provider | JsonRpcProvider) => {
      try {
        const abi = await import(`@/lend/abis/${jsonModuleName}.json`).then((module) => module.default.abi)

        if (!abi) {
          console.error('cannot find abi')
          return null
        } else {
          const iface = new Interface(abi)
          return new Contract(contractAddress, iface.format(), provider)
        }
      } catch (error) {
        console.error(error)
        return null
      }
    },
    [],
  )

  useEffect(() => {
    if (rChainId) {
      const provider = signerRequired
        ? walletProvider
        : walletProvider || new JsonRpcProvider(networks[rChainId].rpcUrl)

      if (jsonModuleName && contractAddress && provider) {
        void (async () => setContract(await getContract(jsonModuleName, contractAddress, provider)))()
      }
    }
  }, [contractAddress, getContract, walletProvider, jsonModuleName, rChainId, signerRequired])

  return contract
}
