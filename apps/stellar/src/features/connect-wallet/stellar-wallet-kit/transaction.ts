import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit/sdk'
import { assert, maybe } from '@primitives/objects.utils'
import { retry } from '@primitives/promise.utils'
import {
  BASE_FEE,
  type contract,
  rpc,
  SorobanDataBuilder,
  Transaction,
  TransactionBuilder,
  type xdr,
} from '@stellar/stellar-sdk'
import { convertStellarError } from './contract'

export type StellarHex = string & { readonly __stellarHex: unique symbol } // Stellar hashes are hex strings without an 0x prefix.
export type StellarTransaction<T = unknown> = contract.AssembledTransaction<T>
export type StellarTransactionResponse = Omit<rpc.Api.SendTransactionResponse, 'hash'> & { hash: StellarHex }

const TRANSACTION_SUBMISSION_RETRIES = 3
const TRANSACTION_SUBMISSION_RETRY_DELAY_MS = 5000
const RESOURCE_FEE_BUFFER_PERCENT = 20n
/** TTL renewal can become payable after simulation. Keep the 20% buffer for larger simulated fees. */
const MIN_RESOURCE_FEE_BUFFER_PER_ENTRY = 600_000n

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
    async () =>
      await transaction.signAndSend({
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
    const { diagnosticEventsXdr, resultXdr, status } = (confirmation as rpc.Api.GetFailedTransactionResponse) ?? {}
    throw (
      convertStellarError(diagnosticEventsXdr, transaction.options.contractId as StellarContract) ??
      new Error(
        `Transaction failed: ${maybe(resultXdr, r => JSON.stringify(r.result)) ?? status ?? 'Missing confirmation'}`,
        { cause: confirmation },
      )
    )
  }

  const result = sent.result // Reading the result checks confirmed execution, not just submission.
  const response = assert(sent.sendTransactionResponse, 'Missing submission response') as StellarTransactionResponse
  return { result, response }
}
