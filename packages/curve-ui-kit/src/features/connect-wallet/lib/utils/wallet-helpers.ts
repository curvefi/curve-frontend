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
