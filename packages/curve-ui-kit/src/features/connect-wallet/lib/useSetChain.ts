import { ethers } from 'ethers'
import { useCallback } from 'react'
import type { WagmiChainId } from '@ui-kit/features/connect-wallet/lib/wagmi/chains'
import { config } from '@ui-kit/features/connect-wallet/lib/wagmi/wagmi-config'
import { switchChain } from '@wagmi/core'
import { useSetChain as useOnboardSetChain } from '@web3-onboard/react'
import { useUseWagmi } from './useWallet'

export const useSetChain = () => {
  const [_, setOnboardChain] = useOnboardSetChain()
  const shouldUseWagmi = useUseWagmi()
  return useCallback(
    async (chainId: number): Promise<boolean> => {
      if (!shouldUseWagmi) {
        return setOnboardChain({ chainId: ethers.toQuantity(chainId) })
      }
      try {
        await switchChain(config, { chainId: chainId as WagmiChainId })
        return true
      } catch (error) {
        console.error('Error switching chain:', error)
        return false
      }
    },
    [setOnboardChain, shouldUseWagmi],
  )
}
