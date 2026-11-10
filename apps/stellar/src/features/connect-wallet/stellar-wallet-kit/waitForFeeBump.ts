import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit/sdk'
import { assert } from '@primitives/objects.utils'
import { BASE_FEE, contract, rpc, SorobanDataBuilder, Transaction, TransactionBuilder, xdr } from '@stellar/stellar-sdk'
import { withPendingToast } from '@ui/features/toast/Toast/notify'
import { t } from '@ui/lib/i18n'
import { waitForTransaction } from '@ui/lib/waitForTransaction'
import {
  getStellarTransactionFees,
  retryStellarTransaction,
  type StellarTransaction,
  type StellarTransactionResponse,
} from './transaction'
import { createRpc } from './wallet'

/** A fee-bump envelope pays resource fees that do not fit in the inner transaction's fee field. */
const signFeeBumpTransaction = async <T>(transaction: StellarTransaction<T>, sign: contract.SignTransaction) => {
  const { networkPassphrase, publicKey, fee } = transaction.options
  const options = { address: assert(publicKey, t`Connect a Stellar wallet`), networkPassphrase }
  const { sorobanData } = getStellarTransactionFees(transaction)
  const builder = rpc.assembleTransaction(
    assert(transaction.built, 'Missing simulated transaction'),
    transaction.simulation!,
  )

  // Assemble auth with zero resource rent, then put the real rent into a zero-fee inner envelope.
  // The SDK builder otherwise adds rent to the uint32 fee and throws before a fee bump can be constructed.
  const envelope = builder
    .setSorobanData(new SorobanDataBuilder(sorobanData).setResourceFee(0n).build())
    .build()
    .toEnvelope()
  if (envelope.type !== 'envelopeTypeTx') throw new Error('Expected a transaction envelope')

  const innerEnvelope = xdr.TransactionEnvelope.envelopeTypeTx(
    new xdr.TransactionV1Envelope({
      ...envelope.value,
      tx: new xdr.Transaction({ ...envelope.value.tx, fee: 0, ext: xdr.TransactionExt.sorobanData(sorobanData) }),
    }),
  )

  const inner = await withPendingToast(
    sign(new Transaction(innerEnvelope, networkPassphrase).toXdr(), options),
    t`Confirm the transaction in your wallet`,
  )
  assert(!inner.error, inner.error?.message ?? 'Failed to sign transaction')
  const outer = TransactionBuilder.buildFeeBumpTransaction(
    options.address,
    fee ?? BASE_FEE,
    new Transaction(inner.signedTxXdr, networkPassphrase),
    networkPassphrase,
  )
  const signed = await withPendingToast(sign(outer.toXdr(), options), t`Confirm the fee bump in your wallet`)
  assert(!signed.error, signed.error?.message ?? 'Failed to sign fee bump')
  return TransactionBuilder.fromXdr(signed.signedTxXdr, networkPassphrase)
}

/** Submit and confirm a fee-bump envelope when required. It includes the inner transaction; do not submit it again. */
export const waitForFeeBump = async <T>(transaction: StellarTransaction<T>) => {
  const server = createRpc(transaction.options)
  const confirmed = await waitForTransaction({
    onExecute: async () => {
      const signed = await signFeeBumpTransaction(
        transaction,
        StellarWalletsKit.signTransaction.bind(StellarWalletsKit),
      )
      return retryStellarTransaction(async () => {
        const response = await server.sendTransaction(signed)
        assert(response.status === 'PENDING', `Transaction submission failed: ${response.status}`)
        return response as StellarTransactionResponse
      })
    },
    waitForConfirmation: async response => {
      const confirmation = await withPendingToast(
        server.pollTransaction(response.hash),
        t`Waiting for transaction confirmation...`,
      )
      if (confirmation.status !== rpc.Api.GetTransactionStatus.SUCCESS)
        throw new Error(`Transaction was not confirmed. Check transaction ${response.hash} before retrying.`)
      return {
        result: transaction.options.parseResultXdr(assert(confirmation.returnValue, 'Missing transaction result')),
        response,
      }
    },
    isSatisfied: confirmations => !!confirmations?.length || !getStellarTransactionFees(transaction).needsFeeBump,
  })
  return confirmed?.[0]
}
