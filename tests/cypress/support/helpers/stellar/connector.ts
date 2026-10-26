/* eslint-disable no-restricted-imports -- Single SDK boundary for Stellar test wallet signing and fixture deployment. */
import type { StellarAddress, StellarContract } from '@/stellar/features/connect-wallet/address'
import { getStellarTransactionFees } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { STELLAR_NETWORKS } from '@/stellar/lib/networks'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit/sdk'
import { type ModuleInterface, ModuleType, Networks } from '@creit.tech/stellar-wallets-kit/types'
import type { TestnetConfig } from '@cy/support/helpers/stellar/stellar-testnet.config'
import { assert } from '@primitives/objects.utils'
import { retry } from '@primitives/promise.utils'
import { BASE_FEE, contract, Keypair, rpc, TransactionBuilder } from '@stellar/stellar-sdk'
import { Duration } from '@ui/features/themes/design/0_primitives'

const POOL_DEPLOYMENT_RETRIES = 5
const POOL_DEPLOYMENT_RETRY_DELAY_MS = Duration.StellarPoolDeploymentRetry

/** Register a real keypair wallet through the wallet kit's module interface. */
export const connectTestWallet = ({ deployer }: TestnetConfig) => {
  const keypair = Keypair.fromSecret(deployer.secret)
  const wallet: ModuleInterface = {
    productId: 'cypress-stellar',
    productName: 'Cypress Stellar wallet',
    productUrl: 'https://stellar.org',
    productIcon: '',
    moduleType: ModuleType.HOT_WALLET,
    isAvailable: () => Promise.resolve(true),
    getAddress: () => Promise.resolve({ address: keypair.publicKey() }),
    getNetwork: () => Promise.resolve({ network: 'TESTNET', networkPassphrase: Networks.TESTNET }),
    signTransaction: (xdr, options) => {
      expect(options?.networkPassphrase).to.equal(Networks.TESTNET)
      const transaction = TransactionBuilder.fromXdr(xdr, Networks.TESTNET)
      transaction.sign(keypair)
      return Promise.resolve({ signedTxXdr: transaction.toXdr(), signerAddress: keypair.publicKey() })
    },
    signAuthEntry: () => Promise.reject(new Error('Separate authorization entries are not supported by this wallet')),
    signMessage: () => Promise.reject(new Error('Message signing is not supported by this wallet')),
  }
  StellarWalletsKit.init({ modules: [wallet], network: Networks.TESTNET, selectedWalletId: wallet.productId })
  return StellarWalletsKit.fetchAddress()
}

type PoolDeployment = { pool: StellarContract }
type Factory = {
  implementation: (params: {
    coin_count: number
    implementation_index: number
  }) => Promise<contract.AssembledTransaction<{ wasm_hash: Buffer } | undefined>>
  deploy_plain_pool: (
    args: {
      deployer: StellarAddress
      params: {
        name: string
        symbol: string
        coins: StellarContract[]
        amplification: bigint
        fee: bigint
        offpeg_fee_multiplier: bigint
        ma_exp_time: bigint
        wasm_hash: Buffer
        asset_types: 0[]
        methods: []
        oracles: StellarContract[]
      }
    },
    options: { simulate: false },
  ) => Promise<contract.AssembledTransaction<contract.Result<PoolDeployment>>>
}

/**
 * A footprint lists the ledger entries a transaction may read or write.
 * Concurrent deployments can change the pool address after simulation, making that list stale.
 */
const isPoolDeploymentFootprintConflict = (confirmation: rpc.Api.GetTransactionResponse | undefined) =>
  confirmation?.status === rpc.Api.GetTransactionStatus.FAILED &&
  !!confirmation.diagnosticEventsXdr?.some(e =>
    e.event.body.value.topics.some(
      t => t.type === 'scvError' && t.value.type === 'sceStorage' && t.value.value.name === 'scecExceededLimit',
    ),
  )

/**
 * Deployment simulation has returned >10 billion stroops, exceeding the ordinary uint32 fee.
 * The SDK's simulate()/signAndSend() path overflows before our shared sender can run.
 * Assemble a zero-fee inner transaction and pay its resource fee through an int64 fee bump.
 * This exception is only for test pool creation; user operations exercise sendStellarTransaction.
 * https://github.com/stellar/stellar-protocol/blob/master/core/cap-0066.md#allow-resource-fees-to-exceed-uint32
 */
const sendPoolDeployment = async (
  transaction: contract.AssembledTransaction<contract.Result<PoolDeployment>>,
  keypair: Keypair,
) => {
  const server = new rpc.Server(transaction.options.rpcUrl)
  const raw = transaction.raw!.build()
  transaction.simulation = await server.simulateTransaction(raw)
  const { sorobanData } = getStellarTransactionFees(transaction)
  const builder = rpc.assembleTransaction(raw, transaction.simulation).setSorobanData(sorobanData)
  // Cancel build()'s resource addition: the inner fee is zero and the outer envelope pays it.
  builder.baseFee = (-sorobanData.resourceFee).toString()
  const inner = builder.build()
  inner.sign(keypair)
  const envelope = TransactionBuilder.buildFeeBumpTransaction(keypair, BASE_FEE, inner, Networks.TESTNET)
  envelope.sign(keypair)
  const submitted = await server.sendTransaction(envelope)
  assert(submitted.status === 'PENDING', `Pool deployment submission failed: ${JSON.stringify(submitted)}`)
  const confirmed = await server.pollTransaction(submitted.hash, { attempts: 60 })
  if (confirmed.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
    throw new Error(`Pool deployment failed: ${confirmed.status}`, { cause: confirmed })
  }
  return transaction.options.parseResultXdr(assert(confirmed.returnValue, 'Missing pool address')).unwrap().pool
}

/** Matches stableswap-rs/scripts/deploy_testnet.sh; the factory allocates a fresh pool address on every call. */
export const deployTestPool = async ({ factory: factoryAddress, deployer, coins }: TestnetConfig) => {
  const factory = await contract.Client.from<Factory>({
    contractId: factoryAddress,
    publicKey: deployer.address,
    networkPassphrase: Networks.TESTNET,
    rpcUrl: STELLAR_NETWORKS['stellar-testnet'].rpcUrl,
  })
  const { result: implementation } = await factory.implementation({ coin_count: coins.length, implementation_index: 0 })
  const { wasm_hash } = assert(implementation, 'Missing pool implementation')
  return retry(
    async () => {
      // Concurrent deployments advance the factory counter, changing the pool address and footprint.
      const transaction = await factory.deploy_plain_pool(
        {
          deployer: deployer.address,
          params: {
            name: 'Cypress StableSwap USDX/USDY/USDZ',
            symbol: 'CY-USDXUSDYUSDZ',
            coins,
            amplification: 100n,
            fee: 30_000_000n,
            offpeg_fee_multiplier: 20_000_000_000n,
            ma_exp_time: 866n,
            wasm_hash,
            asset_types: coins.map(() => 0),
            methods: [],
            oracles: [],
          },
        },
        { simulate: false },
      )
      return sendPoolDeployment(transaction, Keypair.fromSecret(deployer.secret))
    },
    {
      retries: POOL_DEPLOYMENT_RETRIES,
      // Spread retries across ledger closes so competing deployments do not keep colliding.
      delay: () => POOL_DEPLOYMENT_RETRY_DELAY_MS * (1 + Math.random()),
      shouldRetry: error =>
        (error as Error).message.includes('TRY_AGAIN_LATER') ||
        isPoolDeploymentFootprintConflict((error as Error).cause as rpc.Api.GetTransactionResponse | undefined),
    },
  )
}
