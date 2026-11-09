/* eslint-disable no-restricted-syntax -- Bootstrap real contracts on CI's isolated Stellar node. */
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { StellarAddress, StellarContract, StellarSecret } from '@/stellar/features/connect-wallet/address'
import { createRpc } from '@/stellar/features/connect-wallet/stellar-wallet-kit/wallet'
import { Address, Asset, Keypair, Networks, Operation, xdr } from '@stellar/stellar-sdk'
import { confirmStellarTransaction, createSorobanDeploymentSender } from '../support/helpers/stellar/deployment'
import type { TestnetDeployment } from './stellar-testnet'

const STANDALONE_URL = 'http://localhost:8000'
const RPC_URL = `${STANDALONE_URL}/rpc`
const FRIENDBOT_URL = `${STANDALONE_URL}/friendbot`
const TOKEN_CODES = ['USDX', 'USDY', 'USDZ']
const FACTORY_WASM_PATH = resolve(__dirname, '../fixtures/stellar/factory.wasm')
const factoryMethods = {
  registerImplementation: 'register_implementation',
  setImplementationDeployable: 'set_implementation_deployable',
} as const
// The newly deployed factory has no implementations, so its first registration gets index zero.
const FIRST_IMPLEMENTATION_INDEX = 0

/** Deploy the standalone factory and tokens once during Cypress Node setup. */
export const deployStellarStandalone = async (): Promise<TestnetDeployment> => {
  const server = createRpc({ rpcUrl: RPC_URL, allowHttp: true })
  const issuer = Keypair.random()
  const issuerAddress = issuer.publicKey() as StellarAddress

  const sendDeployment = createSorobanDeploymentSender(server, issuer, Networks.STANDALONE)

  assert.equal((await server.getNetwork()).passphrase, Networks.STANDALONE)
  const funding = await fetch(`${FRIENDBOT_URL}?addr=${issuerAddress}`)
  assert(funding.ok, `Friendbot returned HTTP ${funding.status}`)
  // Friendbot has submitted the funding transaction; wait for RPC ingestion before using the account.
  const fundingTransaction = (await funding.json()) as { hash: string }
  await confirmStellarTransaction(server, fundingTransaction.hash)

  const assets = TOKEN_CODES.map(code => new Asset(code, issuerAddress))
  for (const asset of assets) {
    await sendDeployment(Operation.createStellarAssetContract({ asset }))
  }
  const coins = assets.map(asset => asset.contractId(Networks.STANDALONE) as StellarContract)

  const factoryHash = await sendDeployment(Operation.uploadContractWasm({ wasm: await readFile(FACTORY_WASM_PATH) }))
  assert(factoryHash.type === 'scvBytes')
  const factoryAddress = await sendDeployment(
    Operation.createCustomContract({
      address: new Address(issuerAddress),
      wasmHash: factoryHash.value.toBytes(),
      constructorArgs: [new Address(issuerAddress).toScVal(), new Address(issuerAddress).toScVal()],
    }),
  )
  const factory = Address.fromScVal(factoryAddress).toString() as StellarContract
  for (const coinCount of [2, 3]) {
    const wasm = await readFile(resolve(__dirname, `../fixtures/stellar/pool-coins-${coinCount}.wasm`))
    const poolHash = await sendDeployment(Operation.uploadContractWasm({ wasm }))
    await sendDeployment(
      Operation.invokeContractFunction({
        contract: factory,
        function: factoryMethods.registerImplementation,
        args: [xdr.ScVal.scvU32(coinCount), poolHash],
      }),
    )
    await sendDeployment(
      Operation.invokeContractFunction({
        contract: factory,
        function: factoryMethods.setImplementationDeployable,
        args: [xdr.ScVal.scvU32(coinCount), xdr.ScVal.scvU32(FIRST_IMPLEMENTATION_INDEX), xdr.ScVal.scvBool(true)],
      }),
    )
  }

  console.info(`Stellar standalone factory and ${coins.length} test tokens deployed`)
  return { issuer: { address: issuerAddress, secret: issuer.secret() as StellarSecret }, factory, coins }
}
