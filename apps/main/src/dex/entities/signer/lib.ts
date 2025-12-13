import type { Address } from 'viem'
import { useWallet } from '@ui-kit/features/connect-wallet'

export const useSignerAddress = (): { data: Address | undefined } => {
  const { wallet } = useWallet.getState()
  const signerAddress = wallet?.account?.address
  return { data: signerAddress }
}

export const useIsSignerConnected = () => {
  const { data: signerAddress } = useSignerAddress()
  return { data: !!signerAddress }
}
