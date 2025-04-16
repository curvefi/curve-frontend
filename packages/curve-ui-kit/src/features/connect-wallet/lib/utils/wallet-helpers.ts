import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { Address } from '@ui-kit/utils'
import type { EIP1193Provider } from '@web3-onboard/common'
import type { WalletState as Wallet } from '@web3-onboard/core/dist/types'

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

const timeout = (message: string, timeoutMs: number) =>
  new Promise<never>((_, reject) => setTimeout(() => reject(new Error(message)), timeoutMs))

export const withTimeout = <T>(
  connectPromise: Promise<T>,
  message = t`Timeout connecting wallet`,
  timeoutMs = REFRESH_INTERVAL['3s'],
): Promise<T> => Promise.race([connectPromise, timeout(message, timeoutMs)])
