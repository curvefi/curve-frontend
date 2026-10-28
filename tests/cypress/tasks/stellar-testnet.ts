/* eslint-disable no-restricted-imports -- Node-side Stellar test account provisioning. */
import type { StellarAddress, StellarContract, StellarSecret } from '@/stellar/features/connect-wallet/address'
import { TIMEOUTS } from '@cy/support/timeout-categories'
import { assert } from '@primitives/objects.utils'
import { retry, type RetryOptions } from '@primitives/promise.utils'
import {
  Asset,
  BASE_FEE,
  contract,
  Keypair,
  Networks,
  Operation,
  rpc,
  scValToNative,
  TransactionBuilder,
} from '@stellar/stellar-sdk'
import type { TestnetAccount } from '../support/helpers/stellar/stellar-testnet.config'

const INITIAL_TOKEN_BALANCE = '100'
const stellarAccountRetries = (publicKey: string) =>
  ({
    retries: 10,
    delay: () => 1000,
    shouldRetry: (error: unknown) => (error as Error).message === `Account not found: ${publicKey}`,
  }) satisfies RetryOptions
const { timeout: FUNDING_TRANSACTION_EXPIRY_SECONDS } = TIMEOUTS['stellar.fundWallet']

/** Required fields from the STELLAR_TESTNET_CONFIG deployment JSON. */
export type TestnetDeployment = { issuer: TestnetAccount; factory: StellarContract; coins: StellarContract[] }

/** Create and fund a deployer; existing contracts and the issuer are shared across runs. */
export const createTestnetDeployer = async (config: TestnetDeployment, rpcUrl: string): Promise<TestnetAccount> => {
  const wallet = Keypair.random()
  const publicKey = wallet.publicKey()
  const server = new rpc.Server(rpcUrl)
  await server.fundAddress(publicKey).catch((error: Error) => {
    if (!error.message.endsWith('transaction status NOT_FOUND')) throw error // account for rpc delays seeing the transaction
  })
  const account = await retry(() => server.getAccount(publicKey), stellarAccountRetries(publicKey))
  const { issuer, coins } = config
  const assets = await Promise.all(
    coins.map(async contractId => {
      const { result: symbol } = await contract.AssembledTransaction.build<string>({
        contractId,
        method: 'symbol',
        args: [],
        publicKey,
        networkPassphrase: Networks.TESTNET,
        rpcUrl,
        parseResultXdr: scValToNative,
      })
      return new Asset(symbol, issuer.address)
    }),
  )
  const builder = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: Networks.TESTNET })
  for (const asset of assets) {
    builder.addOperation(Operation.changeTrust({ asset }))
    // Only the transaction source consumes a sequence number; the issuer authorizes each payment.
    builder.addOperation(
      Operation.payment({ source: issuer.address, destination: publicKey, asset, amount: INITIAL_TOKEN_BALANCE }),
    )
  }
  const transaction = builder.setTimeout(FUNDING_TRANSACTION_EXPIRY_SECONDS).build()
  transaction.sign(wallet, Keypair.fromSecret(issuer.secret))
  const sent = await server.sendTransaction(transaction)
  assert(sent.status === 'PENDING', `Stellar wallet funding submission failed: ${JSON.stringify(sent)}`)
  const confirmed = await server.pollTransaction(sent.hash, { attempts: FUNDING_TRANSACTION_EXPIRY_SECONDS })
  assert(
    confirmed.status === rpc.Api.GetTransactionStatus.SUCCESS,
    `Stellar wallet funding failed: ${JSON.stringify(confirmed)}`,
  )
  return { address: publicKey as StellarAddress, secret: wallet.secret() as StellarSecret }
}
