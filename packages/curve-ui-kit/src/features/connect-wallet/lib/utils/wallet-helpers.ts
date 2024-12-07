import type { WalletState as Wallet } from '@web3-onboard/core/dist/types'
import { BrowserProvider } from 'ethers'
import type { Address } from '@ui-kit/utils'

export const getWalletProvider = (wallet: Wallet) => new BrowserProvider(wallet.provider)

export function getWalletChainId(wallet: Wallet | undefined | null) {
  if (!wallet) return null
  const chainId = wallet.chains[0].id
  return Number(BigInt(chainId).toString())
}

export const getWalletSignerAddress = (wallet: Wallet | undefined | null): Address | undefined =>
  wallet?.accounts[0]?.address
