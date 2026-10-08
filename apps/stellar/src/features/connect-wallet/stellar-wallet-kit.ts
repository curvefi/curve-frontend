/* eslint-disable no-restricted-imports -- This module wraps Stellar wallet and contract SDK access. */
import type { StellarAddress, StellarContract } from '@/stellar/features/connect-wallet/address'
import { STELLAR_NETWORKS, type StellarNetwork } from '@/stellar/lib/networks'
import { defaultModules } from '@creit.tech/stellar-wallets-kit/modules/utils'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit/sdk'
import { activeModule } from '@creit.tech/stellar-wallets-kit/state'
import { type ISupportedWallet, KitEventType } from '@creit.tech/stellar-wallets-kit/types'
import { assert } from '@primitives/objects.utils'
import { retry } from '@primitives/promise.utils'
import {
  Address,
  BASE_FEE,
  contract,
  nativeToScVal,
  Networks,
  rpc,
  scValToNative,
  SorobanDataBuilder,
  StrKey,
  Transaction,
  TransactionBuilder,
  xdr,
} from '@stellar/stellar-sdk'

export type WalletConnector = ISupportedWallet
export type StellarHex = string & { readonly __stellarHex: unique symbol } // Stellar hashes are hex strings without an 0x prefix.
export type StellarTransaction<T = bigint> = contract.AssembledTransaction<T>
export type StellarTransactionResponse = Omit<rpc.Api.SendTransactionResponse, 'hash'> & { hash: StellarHex }

const TRANSACTION_SUBMISSION_RETRIES = 3
const TRANSACTION_SUBMISSION_RETRY_DELAY_MS = 5000
const RESOURCE_FEE_BUFFER_PERCENT = 20n
const MAX_INCLUSION_FEE = 50_000n // 0.005 XLM ≈ $0.0011 at the time of writing; resource fees are separate.

export const initWallet = (onError: (error: Error) => void) => {
  const modules = defaultModules()
  StellarWalletsKit.init({ modules })
  const refreshAddress = () => activeModule.value && void StellarWalletsKit.fetchAddress().catch(onError)
  modules.forEach(wallet =>
    wallet.onChange?.(
      ({ error }) =>
        activeModule.value === wallet &&
        (error ? onError(new Error(`${error.code}: ${error.message}`)) : refreshAddress()),
    ),
  )
  refreshAddress()
  window.addEventListener('focus', refreshAddress) // some wallets e.g., Freighter don't listen to changes, refresh when returning to the app
  return () => window.removeEventListener('focus', refreshAddress)
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

type ContractArgument = StellarAddress | StellarContract | bigint | number | boolean | ContractArgument[]

const encodeContractArgument = (value: ContractArgument): xdr.ScVal =>
  Array.isArray(value)
    ? xdr.ScVal.scvVec(value.map(encodeContractArgument))
    : typeof value === 'string'
      ? new Address(value).toScVal()
      : nativeToScVal(
          value,
          typeof value === 'bigint' ? { type: 'i128' } : typeof value === 'number' ? { type: 'u32' } : {},
        )

const PASSPHRASES = { stellar: Networks.PUBLIC, 'stellar-testnet': Networks.TESTNET }

/** Prepare the fee budget without mutating the SDK's original simulation or built transaction. */
export function getStellarTransactionFees<T>(transaction: StellarTransaction<T>) {
  const { transactionData } = transaction.simulationData
  const resourceFee = transactionData.resourceFee
  // Add our 20% application headroom for rent changes between simulation and execution.
  // BigInt division truncates: adding denominator - 1 (99) rounds up to a whole stroop.
  // For example, 40,837 * 1.20 = 49,004.4 becomes 49,005 stroops.
  const bufferedResourceFee = (resourceFee * (100n + RESOURCE_FEE_BUFFER_PERCENT) + 99n) / 100n
  // The SDK fee option is inclusion-only. Its built.fee includes resources and is mutated by sign().
  const inclusionFee = BigInt(transaction.options.fee ?? BASE_FEE)
  const sorobanData = new SorobanDataBuilder(transactionData).setResourceFee(bufferedResourceFee).build()
  return { fee: (inclusionFee + bufferedResourceFee).toString(), inclusionFee: inclusionFee.toString(), sorobanData }
}

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
    fee: MAX_INCLUSION_FEE.toString(),
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

/**
 * SDK sign() adds the resource fee twice: https://github.com/stellar/js-stellar-sdk/issues/1357
 * Preserve its refreshed timeout, but explicitly restore our inclusion fee and buffered resources before asking the wallet to sign.
 */
const fixResourceFee = <T>(
  envelope: string,
  transaction: contract.AssembledTransaction<T>,
  fee: string,
  sorobanData: xdr.SorobanTransactionData,
) =>
  TransactionBuilder.cloneFrom(new Transaction(envelope, transaction.options.networkPassphrase), {
    fee,
    sorobanData,
  }).build()

export async function sendStellarTransaction<T>(transaction: StellarTransaction<T>) {
  // Capture the budget once, before SDK sign() rebuilds its transaction; retries reuse it.
  const { sorobanData, inclusionFee } = getStellarTransactionFees(transaction)
  const sent = await retry(
    () =>
      transaction.signAndSend({
        signTransaction: (envelope, options) => {
          const tx = fixResourceFee(envelope, transaction, inclusionFee, sorobanData)
          return StellarWalletsKit.signTransaction(tx.toXdr(), options)
        },
        watcher: {}, // we could change the watcher to log submission and confirmation events
      }),
    {
      retries: TRANSACTION_SUBMISSION_RETRIES,
      delay: () => TRANSACTION_SUBMISSION_RETRY_DELAY_MS,
      shouldRetry: error => (error as Error).message.includes('TRY_AGAIN_LATER'),
    },
  )
  const confirmation = sent.getTransactionResponse
  if (confirmation?.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
    // The SDK tries to decode an undefined return value for failed transactions, hiding the actual failure.
    const reason =
      confirmation && 'resultXdr' in confirmation
        ? JSON.stringify(confirmation.resultXdr.result)
        : (confirmation?.status ?? 'Missing confirmation')
    throw new Error(`Stellar transaction did not succeed: ${reason}`, { cause: confirmation })
  }
  const result = sent.result // Reading the result checks confirmed execution, not just submission.
  const response = assert(sent.sendTransactionResponse, 'Missing submission response') as StellarTransactionResponse
  return { result, response }
}
