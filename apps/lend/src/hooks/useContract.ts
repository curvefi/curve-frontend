import { Contract, Interface, JsonRpcProvider } from 'ethers'
import { useCallback, useEffect, useState } from 'react'

import networks from '@/networks'
import useStore from '@/store/useStore'

const useAbiGaugeTotalSupply = (
  rChainId: ChainId,
  signerRequired: boolean,
  jsonModuleName: string,
  contractAddress: string | undefined
) => {
  const getProvider = useStore((state) => state.wallet.getProvider)

  const [contract, setContract] = useState<Contract | null>(null)

  const getContract = useCallback(
    async (jsonModuleName: string, contractAddress: string, provider: Provider | JsonRpcProvider) => {
      try {
        const abi = await import(`@/abis/${jsonModuleName}.json`).then((module) => module.default.abi)

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
    []
  )

  useEffect(() => {
    if (rChainId) {
      const provider = signerRequired
        ? getProvider('')
        : getProvider('') || new JsonRpcProvider(networks[rChainId].rpcUrl)

      if (jsonModuleName && contractAddress && provider) {
        ;(async () => setContract(await getContract(jsonModuleName, contractAddress, provider)))()
      }
    }
  }, [contractAddress, getContract, getProvider, jsonModuleName, rChainId, signerRequired])

  return contract
}

export default useAbiGaugeTotalSupply
