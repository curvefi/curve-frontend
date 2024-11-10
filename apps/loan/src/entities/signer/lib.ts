import type { Address } from 'viem'
import useStore from '@/store/useStore'

export const useSignerAddress = (): { data: Address | undefined } => {
  const onboardInstance = useStore((state) => state.wallet.onboard)
  const signerAddress = onboardInstance?.state.get().wallets?.[0]?.accounts?.[0]?.address
  return { data: signerAddress }
}

export const useIsSignerConnected = () => {
  const { data: signerAddress } = useSignerAddress()
  return { data: !!signerAddress }
}
