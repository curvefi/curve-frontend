/* eslint-disable no-restricted-syntax -- Shared SDK boundary for Stellar fixture deployment. */
import { BASE_FEE, type Keypair, rpc, TransactionBuilder, type xdr } from '@stellar/stellar-sdk'

const TRANSACTION_POLL_ATTEMPTS = 60
const TRANSACTION_TIMEOUT_SECONDS = 60

/** Wait for RPC ingestion and preserve failed confirmations for deployment retry checks. */
export const confirmStellarTransaction = async (server: rpc.Server, hash: string) => {
  const confirmation = await server.pollTransaction(hash, { attempts: TRANSACTION_POLL_ATTEMPTS })
  if (confirmation.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
    throw new Error(`Stellar transaction failed: ${confirmation.status}`, { cause: confirmation })
  }
  return confirmation
}

/**
 * Create a sender for Soroban fixture operations.
 * Each call builds, simulates, signs, submits and confirms a deployment.
 * Deployment fees can exceed uint32; a zero-fee inner transaction and int64 fee bump avoid overflow.
 * The optional fee callback lets pool deployments apply the app's resource fee buffer.
 */
export const createSorobanDeploymentSender =
  (server: rpc.Server, keypair: Keypair, networkPassphrase: string, timeoutInSeconds = TRANSACTION_TIMEOUT_SECONDS) =>
  async (
    operation: xdr.Operation,
    getSorobanData?: (simulation: rpc.Api.SimulateTransactionSuccessResponse) => xdr.SorobanTransactionData,
  ) => {
    const transaction = new TransactionBuilder(await server.getAccount(keypair.publicKey()), {
      fee: BASE_FEE,
      networkPassphrase,
    })
      .addOperation(operation)
      .setTimeout(timeoutInSeconds)
      .build()
    const simulation = await server.simulateTransaction(transaction)
    if (!rpc.Api.isSimulationSuccess(simulation)) {
      throw new Error(`Stellar deployment simulation failed: ${JSON.stringify(simulation)}`)
    }
    const sorobanData = getSorobanData?.(simulation) ?? simulation.transactionData.build()
    const transactionBuilder = rpc.assembleTransaction(transaction, simulation).setSorobanData(sorobanData)
    // build() adds the resource fee; cancel it so the inner transaction has zero fees.
    transactionBuilder.baseFee = (-sorobanData.resourceFee).toString()
    const innerTransaction = transactionBuilder.build()
    innerTransaction.sign(keypair)
    const feeBumpTransaction = TransactionBuilder.buildFeeBumpTransaction(
      keypair,
      BASE_FEE,
      innerTransaction,
      innerTransaction.networkPassphrase,
    )
    feeBumpTransaction.sign(keypair)
    const submission = await server.sendTransaction(feeBumpTransaction)
    if (submission.status !== 'PENDING') {
      throw new Error(`Stellar deployment submission failed: ${JSON.stringify(submission)}`)
    }
    const confirmation = await confirmStellarTransaction(server, submission.hash)
    if (!confirmation.returnValue) throw new Error('Missing deployment return value')
    return confirmation.returnValue
  }
