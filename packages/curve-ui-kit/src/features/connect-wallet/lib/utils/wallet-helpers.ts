import type { Eip1193Provider } from 'ethers'
import { Address } from '@ui-kit/utils'
import type { WalletState } from '@web3-onboard/core/dist/types'
import { Wallet } from '../types'

// todo: inline the following functions
export const getWalletChainId = (wallet: Wallet | undefined | null) => wallet?.chainId

export const getWalletSignerAddress = (wallet: Wallet | undefined | null): Address | undefined =>
  wallet?.account?.address

export const getWalletSignerEns = (wallet: Wallet | undefined | null): string | undefined => wallet?.account?.ensName

export function getRpcProvider(wallet: Wallet): Eip1193Provider {
  if ('isTrustWallet' in wallet.provider && window.ethereum) {
    // unable to connect to curvejs with wallet.provider
    return window.ethereum
  }
  if ('isExodus' in wallet.provider && typeof window.exodus.ethereum !== 'undefined') {
    return window.exodus.ethereum
  }
  return wallet.provider
}

export function getWalletProvider(wallet: Wallet) {
  if ('isTrustWallet' in wallet.provider) {
    // unable to connect to curvejs with wallet.provider
    return window.ethereum
  } else if ('isExodus' in wallet.provider && typeof window.exodus.ethereum !== 'undefined') {
    return window.exodus.ethereum
  }
  return wallet.provider
}

export const convertOnboardWallet = ({ chains, provider, accounts: [account], label }: WalletState): Wallet => ({
  chainId: Number(BigInt(chains[0].id).toString()),
  provider,
  account: { ensName: account.ens?.name, address: account.address },
  label,
})
