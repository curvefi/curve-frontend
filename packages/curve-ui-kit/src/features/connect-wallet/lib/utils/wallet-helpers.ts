import type { WalletState as Wallet } from '@web3-onboard/core/dist/types'
import { Address } from '@ui-kit/utils'
import type { EIP1193Provider } from '@web3-onboard/common'

export function getWalletChainId(wallet: Wallet | undefined | null) {
  const chainId = wallet?.chains[0].id
  return chainId && Number(BigInt(chainId).toString())
}

export const getWalletSignerAddress = (wallet: Wallet | undefined | null): Address | undefined =>
  wallet?.accounts[0]?.address

export const getWalletSignerEns = (wallet: Wallet | undefined | null): string | undefined =>
  wallet?.accounts[0]?.ens?.name

export function getRpcProvider(wallet: Wallet): EIP1193Provider {
  if ('isTrustWallet' in wallet.provider && window.ethereum) {
    // unable to connect to curvejs with wallet.provider
    return window.ethereum as any // todo: why do we need any here?
  }
  if ('isExodus' in wallet.provider && typeof window.exodus.ethereum !== 'undefined') {
    return window.exodus.ethereum
  }
  return wallet.provider
}
