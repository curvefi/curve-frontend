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
export type StellarTransaction<T = unknown> = contract.AssembledTransaction<T>
export type StellarTransactionResponse = Omit<rpc.Api.SendTransactionResponse, 'hash'> & { hash: StellarHex }

const TRANSACTION_SUBMISSION_RETRIES = 3
const TRANSACTION_SUBMISSION_RETRY_DELAY_MS = 5000
const RESOURCE_FEE_BUFFER_PERCENT = 20n
const MAX_INCLUSION_FEE = 100_000n // ≈ $0.0018 at the time of writing; resource fees are separate.
const MIN_RESOURCE_FEE_BUFFER_PER_ENTRY = 60_000n // ≈ $0.0011 at the time of writing; TTL renewal headroom.

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

/**
 * Reserve TTL renewal headroom in stroops for each contract data/code entry in the footprint.
 * Renewal may become necessary after simulation, even when simulated rent is zero.
 */
const getMinResourceFeeBuffer = ({ readOnly, readWrite }: xdr.LedgerFootprint) => {
  const expiringEntryCount = [...readOnly, ...readWrite].filter(e =>
    ['contractData', 'contractCode'].includes(e.type),
  ).length
  return MIN_RESOURCE_FEE_BUFFER_PER_ENTRY * BigInt(expiringEntryCount)
}

/** Prepare the fee budget without mutating the SDK's original simulation or built transaction. */
export function getStellarTransactionFees<T>({ options, simulationData: { transactionData } }: StellarTransaction<T>) {
  const { resources, resourceFee } = transactionData
  // Round the proportional buffer up to a whole stroop and apply at least the per-entry minimum.
  const proportionalBuffer = (resourceFee * RESOURCE_FEE_BUFFER_PERCENT + 99n) / 100n
  const minResourceFeeBuffer = getMinResourceFeeBuffer(resources.footprint)
  const bufferedResourceFee =
    resourceFee + (proportionalBuffer > minResourceFeeBuffer ? proportionalBuffer : minResourceFeeBuffer)
  // The SDK fee option is inclusion-only.
  const inclusionFee = BigInt(options.fee ?? BASE_FEE)
  const sorobanData = new SorobanDataBuilder(transactionData).setResourceFee(bufferedResourceFee).build()
  return { fee: (inclusionFee + bufferedResourceFee).toString(), sorobanData }
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

/** Apply our TTL buffer while preserving the SDK's refreshed timeout. */
const applyResourceFeeBuffer = <T>(
  envelope: string,
  transaction: StellarTransaction<T>,
  sorobanData: xdr.SorobanTransactionData,
) =>
  TransactionBuilder.cloneFrom(new Transaction(envelope, transaction.options.networkPassphrase), {
    sorobanData,
  }).build()

export async function sendStellarTransaction<T>(
  transaction: StellarTransaction<T>,
  signTransaction: contract.SignTransaction = StellarWalletsKit.signTransaction.bind(StellarWalletsKit),
) {
  const { sorobanData } = getStellarTransactionFees(transaction)
  const sent = await retry(
    () =>
      transaction.signAndSend({
        signTransaction: (envelope, options) => {
          const tx = applyResourceFeeBuffer(envelope, transaction, sorobanData)
          return signTransaction(tx.toXdr(), options)
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
