/* eslint-disable no-restricted-syntax -- Single SDK boundary for Stellar test wallet signing and fixture deployment. */
import type { StellarAddress, StellarContract } from '@/stellar/features/connect-wallet/address'
import { StellarFetchRetry } from '@/stellar/features/connect-wallet/stellar-wallet-kit/contract'
import { getStellarTransactionFees } from '@/stellar/features/connect-wallet/stellar-wallet-kit/transaction'
import { createRpc } from '@/stellar/features/connect-wallet/stellar-wallet-kit/wallet'
import { STELLAR_NETWORKS } from '@/stellar/lib/networks'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit/sdk'
import { type ModuleInterface, ModuleType } from '@creit.tech/stellar-wallets-kit/types'
import type { TestnetConfig } from '@cy/support/helpers/stellar/stellar-testnet.config'
import { assert } from '@primitives/objects.utils'
import { retry } from '@primitives/promise.utils'
import { contract, Keypair, rpc, TransactionBuilder } from '@stellar/stellar-sdk'
import { Duration } from '@ui/features/themes/design/0_primitives'
import { createSorobanDeploymentSender } from './deployment'

/** Rebuild and sign on every attempt so rejected transactions get a fresh sequence and simulation. */
export const retryTestnetSetup = <T>(
  buildAndSend: () => Promise<T>,
  shouldRetry: (error: unknown) => boolean = () => false,
) =>
  retry(buildAndSend, {
    retries: 5,
    // Spread retries across ledger closes so competing deployments do not keep colliding.
    delay: () => Duration.StellarPoolDeploymentRetry * (1 + Math.random()),
    shouldRetry: error => /\b(TRY_AGAIN_LATER|tx_bad_seq)\b/.test((error as Error).message) || shouldRetry(error),
  })

/** Register a real keypair wallet through the wallet kit's module interface. */
export const connectTestWallet = ({ deployer }: TestnetConfig) => {
  const keypair = Keypair.fromSecret(deployer.secret)
  const { networkPassphrase } = STELLAR_NETWORKS['stellar-testnet']
  const wallet: ModuleInterface = {
    productId: 'cypress-stellar',
    productName: 'Cypress Stellar wallet',
    productUrl: 'https://stellar.org',
    productIcon: '',
    moduleType: ModuleType.HOT_WALLET,
    isAvailable: () => Promise.resolve(true),
    getAddress: () => Promise.resolve({ address: keypair.publicKey() }),
    getNetwork: () => Promise.resolve({ network: 'TESTNET', networkPassphrase }),
    signTransaction: (xdr, options) => {
      expect(options?.networkPassphrase).to.equal(networkPassphrase)
      const transaction = TransactionBuilder.fromXdr(xdr, networkPassphrase)
      transaction.sign(keypair)
      return Promise.resolve({ signedTxXdr: transaction.toXdr(), signerAddress: keypair.publicKey() })
    },
    signAuthEntry: () => Promise.reject(new Error('Separate authorization entries are not supported by this wallet')),
    signMessage: () => Promise.reject(new Error('Message signing is not supported by this wallet')),
  }
  StellarWalletsKit.init({ modules: [wallet], network: networkPassphrase, selectedWalletId: wallet.productId })
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
 * Use the shared deployment sender with the app's fee buffer.
 * User operations exercise sendStellarTransaction.
 * https://github.com/stellar/stellar-protocol/blob/master/core/cap-0066.md#allow-resource-fees-to-exceed-uint32
 */
const sendPoolDeployment = async (
  transaction: contract.AssembledTransaction<contract.Result<PoolDeployment>>,
  keypair: Keypair,
) => {
  const sendDeployment = createSorobanDeploymentSender(
    createRpc(transaction.options),
    keypair,
    transaction.options.networkPassphrase,
    transaction.options.timeoutInSeconds ?? contract.DEFAULT_TIMEOUT,
  )
  const [operation] = transaction.raw!.operations
  const returnValue = await sendDeployment(operation, simulation => {
    transaction.simulation = simulation
    return getStellarTransactionFees(transaction).sorobanData
  })
  return transaction.options.parseResultXdr(returnValue).unwrap().pool
}

/** Matches stableswap-rs/scripts/deploy_testnet.sh; the factory allocates a fresh pool address on every call. */
export const deployTestPool = async ({ factory: factoryAddress, deployer, coins }: TestnetConfig) => {
  const { rpcUrl, networkPassphrase, allowHttp } = STELLAR_NETWORKS['stellar-testnet']
  const factory = await retry(
    () =>
      contract.Client.from<Factory>({
        contractId: factoryAddress,
        publicKey: deployer.address,
        networkPassphrase,
        rpcUrl,
        allowHttp,
      }),
    StellarFetchRetry,
  )
  const { result: implementation } = await factory.implementation({ coin_count: coins.length, implementation_index: 0 })
  const { wasm_hash } = assert(implementation, 'Missing pool implementation')
  return retryTestnetSetup(
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
    error => isPoolDeploymentFootprintConflict((error as Error).cause as rpc.Api.GetTransactionResponse | undefined),
  )
}
