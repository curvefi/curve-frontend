/* eslint-disable no-restricted-imports -- Single SDK boundary for Stellar test wallet signing and fixture deployment. */
import type { StellarAddress, StellarContract } from '@/stellar/features/connect-wallet/address'
import { sendStellarTransaction } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { STELLAR_NETWORKS } from '@/stellar/lib/networks'
import { StellarWalletsKit } from '@creit-tech/stellar-wallets-kit/sdk'
import { type ModuleInterface, ModuleType, Networks } from '@creit-tech/stellar-wallets-kit/types'
import type { TestnetConfig } from '@cy/support/helpers/stellar/stellar-testnet.config'
import { contract, Keypair, TransactionBuilder } from '@stellar/stellar-sdk'

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

type Factory = {
  deploy_plain_pool: (params: {
    deployer: StellarAddress
    name: string
    symbol: string
    coins: StellarContract[]
    a: bigint
    fee: bigint
    offpeg_fee_multiplier: bigint
    ma_exp_time: bigint
    implementation_idx: number
    asset_types: 0[]
    methods: []
    oracles: StellarContract[]
  }) => Promise<contract.AssembledTransaction<contract.Result<StellarContract>>>
}

/** Matches stableswap-rs/scripts/deploy_testnet.sh; the factory allocates a fresh pool address on every call. */
export const deployTestPool = async ({ factory: factoryAddress, deployer, coins }: TestnetConfig) => {
  const factory = await contract.Client.from<Factory>({
    contractId: factoryAddress,
    publicKey: deployer.address,
    networkPassphrase: Networks.TESTNET,
    rpcUrl: STELLAR_NETWORKS['stellar-testnet'].rpcUrl,
    signTransaction: (xdr, options) => StellarWalletsKit.signTransaction(xdr, options),
  })
  const transaction = await factory.deploy_plain_pool({
    deployer: deployer.address,
    name: 'Cypress StableSwap USDX/USDY/USDZ',
    symbol: 'CY-USDXUSDYUSDZ',
    coins,
    a: 100n,
    fee: 30_000_000n,
    offpeg_fee_multiplier: 20_000_000_000n,
    ma_exp_time: 0n,
    implementation_idx: 0,
    asset_types: coins.map(() => 0),
    methods: [],
    oracles: [],
  })
  const { result } = await sendStellarTransaction(transaction)
  return result.unwrap()
}
