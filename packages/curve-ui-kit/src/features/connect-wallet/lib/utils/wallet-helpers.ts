import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { Address } from '@ui-kit/utils'
import { Wallet } from '../types'

// todo: inline the following functions
export const getWalletChainId = (wallet: Wallet | undefined | null) => wallet?.chainId

export const getWalletSignerAddress = (wallet: Wallet | undefined | null): Address | undefined =>
  wallet?.account?.address

export const getWalletSignerEns = (wallet: Wallet | undefined | null): string | undefined => wallet?.account?.ensName

const timeout = (message: string, timeoutMs: number) =>
  new Promise<never>((_, reject) => setTimeout(() => reject(new Error(message)), timeoutMs))

export const withTimeout = <T>(
  connectPromise: Promise<T>,
  message = t`Timeout connecting wallet`,
  timeoutMs = REFRESH_INTERVAL['3s'],
): Promise<T> => Promise.race([connectPromise, timeout(message, timeoutMs)])
