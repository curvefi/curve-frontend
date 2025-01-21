import type { WalletState as Wallet } from '@web3-onboard/core/dist/types'
import { Address } from '@ui-kit/utils'

export function getWalletChainId(wallet: Wallet | undefined | null) {
  const chainId = wallet?.chains[0].id
  return chainId && Number(BigInt(chainId).toString())
}

export const getWalletSignerAddress = (wallet: Wallet | undefined | null): Address | undefined =>
  wallet?.accounts[0]?.address

export const getWalletSignerEns = (wallet: Wallet | undefined | null): string | undefined =>
  wallet?.accounts[0]?.ens?.name
