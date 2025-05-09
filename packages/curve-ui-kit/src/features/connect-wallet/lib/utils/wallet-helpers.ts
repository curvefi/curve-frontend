import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { Address } from '@ui-kit/utils'
import type { WalletState } from '@web3-onboard/core/dist/types'
import { Wallet } from '../types'

// todo: inline the following functions
export const getWalletChainId = (wallet: Wallet | undefined | null) => wallet?.chainId

export const getWalletSignerAddress = (wallet: Wallet | undefined | null): Address | undefined =>
  wallet?.account?.address

export const getWalletSignerEns = (wallet: Wallet | undefined | null): string | undefined => wallet?.account?.ensName

export const convertOnboardWallet = ({ chains, provider, accounts: [account], label }: WalletState): Wallet => ({
  chainId: Number(BigInt(chains[0].id).toString()),
  provider,
  account: { ensName: account.ens?.name, address: account.address },
  label,
})

const timeout = (message: string, timeoutMs: number) =>
  new Promise<never>((_, reject) => setTimeout(() => reject(new Error(message)), timeoutMs))

export const withTimeout = <T>(
  connectPromise: Promise<T>,
  message = t`Timeout connecting wallet`,
  timeoutMs = REFRESH_INTERVAL['3s'],
): Promise<T> => Promise.race([connectPromise, timeout(message, timeoutMs)])
