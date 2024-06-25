import type { WalletState } from '@web3-onboard/core'

export function getWallet(walletState: WalletState | null): {
  walletChainIdHex: string | null
  walletChainId: string | null
  walletSignerAddress: string
} {
  if (!walletState) return { walletChainIdHex: null, walletChainId: null, walletSignerAddress: '' }
  const chainIdHex = walletState?.chains?.[0]?.id ?? null

  return {
    walletChainIdHex: chainIdHex,
    walletChainId: chainIdHex ? BigInt(chainIdHex).toString() : null,
    walletSignerAddress: walletState?.accounts?.[0]?.address?.toLowerCase() ?? '',
  }
}
