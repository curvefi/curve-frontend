/* eslint-disable no-restricted-imports -- This module wraps Stellar wallet and contract SDK access. */
import type { StellarAddress, StellarContract } from '@/stellar/features/connect-wallet/address'
import { STELLAR_NETWORKS, type StellarNetwork } from '@/stellar/lib/networks'
import { defaultModules } from '@creit-tech/stellar-wallets-kit/modules/utils'
import { StellarWalletsKit } from '@creit-tech/stellar-wallets-kit/sdk'
import { activeModule } from '@creit-tech/stellar-wallets-kit/state'
import { type ISupportedWallet, KitEventType } from '@creit-tech/stellar-wallets-kit/types'
import { assert } from '@primitives/objects.utils'
import { Address, contract, nativeToScVal, Networks, type rpc, scValToNative, StrKey, xdr } from '@stellar/stellar-sdk'

export type WalletConnector = ISupportedWallet
export type StellarHex = string & { readonly __stellarHex: unique symbol } // Stellar hashes are hex strings without an 0x prefix.
export type StellarTransaction<T = bigint> = contract.AssembledTransaction<T>
export type StellarTransactionResponse = Omit<rpc.Api.SendTransactionResponse, 'hash'> & { hash: StellarHex }

export const initWallet = async () => {
  StellarWalletsKit.init({ modules: defaultModules() })
  if (activeModule.value) await StellarWalletsKit.fetchAddress()
}

export const onWalletAddressChanged = (onChange: (address: StellarAddress | undefined) => void) =>
  StellarWalletsKit.on(KitEventType.STATE_UPDATED, ({ payload }) =>
    onChange(payload.address as StellarAddress | undefined),
  )

export const refreshSupportedWallets = () => StellarWalletsKit.refreshSupportedWallets()

export const connectWallet = async (connector: WalletConnector) => {
  StellarWalletsKit.setWallet(connector.id)
  await StellarWalletsKit.fetchAddress()
}

export const disconnectWallet = () => StellarWalletsKit.disconnect()

export const isContractAddress = (address: string): address is StellarContract => StrKey.isValidContract(address)
export const isAccountAddress = (address: string): address is StellarAddress => StrKey.isValidEd25519PublicKey(address)

type ContractArgument = StellarAddress | StellarContract | bigint | boolean | ContractArgument[]

const encodeContractArgument = (value: ContractArgument): xdr.ScVal =>
  Array.isArray(value)
    ? xdr.ScVal.scvVec(value.map(encodeContractArgument))
    : typeof value === 'string'
      ? new Address(value).toScVal()
      : nativeToScVal(value, typeof value === 'bigint' ? { type: 'i128' } : {})

const PASSPHRASES = { stellar: Networks.PUBLIC, 'stellar-testnet': Networks.TESTNET }

export async function simulateContractCall<T>(
  network: StellarNetwork,
  contractId: StellarContract,
  method: string,
  args: ContractArgument[] = [],
  account?: StellarAddress,
) {
  const transaction = await contract.AssembledTransaction.build<T>({
    contractId,
    method,
    args: args.map(encodeContractArgument),
    publicKey: account,
    address: account,
    networkPassphrase: PASSPHRASES[network],
    rpcUrl: STELLAR_NETWORKS[network].rpcUrl,
    parseResultXdr: value => scValToNative(value) as T,
  })
  void transaction.simulationData // The SDK getter throws if simulation failed or requires state restoration.
  return transaction
}

export const readContract = async <T>(
  network: StellarNetwork,
  contractId: StellarContract,
  method: string,
  args: ContractArgument[] = [],
) => (await simulateContractCall<T>(network, contractId, method, args)).result

export async function sendStellarTransaction(transaction: StellarTransaction) {
  const sent = await transaction.signAndSend({
    signTransaction: (transaction, options) => StellarWalletsKit.signTransaction(transaction, options),
    watcher: {}, // we could change the watcher to log submission and confirmation events
  })
  void sent.result // Reading the result checks confirmed execution, not just submission.
  return assert(sent.sendTransactionResponse, 'Missing submission response') as StellarTransactionResponse
}
