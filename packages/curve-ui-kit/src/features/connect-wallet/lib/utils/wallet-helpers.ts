import type { WalletState as Wallet } from '@web3-onboard/core/dist/types'

export function getWalletChainId(wallet: Wallet | undefined | null) {
  if (!wallet) return null
  const chainId = wallet.chains[0].id
  return Number(BigInt(chainId).toString())
}

export function getWalletSignerAddress(wallet: Wallet | undefined | null) {
  if (!wallet) return ''
  return wallet.accounts[0]?.address
}

export function getWalletSignerEns(wallet: Wallet | undefined | null) {
  if (!wallet) return ''
  return wallet.accounts[0]?.ens?.name
}
