import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import {
  encodeContractValue,
  simulateContractCall,
} from '@/stellar/features/connect-wallet/stellar-wallet-kit/contract'
import { STELLAR_POOL_LIMITS } from '@/stellar/features/create-pool/constants'
import type { CreatePoolParams, CreatePoolQuery } from '@/stellar/features/create-pool/types'
import { createPoolValidationSuite } from '@/stellar/queries/validation/create-pool.validation'
import { assert } from '@primitives/objects.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { toWei } from '@ui/lib/decimal'

// PlainPoolParams in stableswap-rs/contracts/factory/src/types.rs.
const PARAMETER_TYPES = {
  type: {
    name: ['symbol', 'string'],
    symbol: ['symbol', 'string'],
    coins: ['symbol', 'address'],
    amplification: ['symbol', 'i128'],
    fee: ['symbol', 'i128'],
    offpeg_fee_multiplier: ['symbol', 'i128'],
    ma_exp_time: ['symbol', 'u64'],
    wasm_hash: ['symbol', 'bytes'],
    asset_types: ['symbol', 'u32'],
    methods: ['symbol', 'symbol'],
    oracles: ['symbol', 'address'],
  },
} satisfies Parameters<typeof encodeContractValue>[1]

export const { useQuery: useCreatePoolSimulation, fetchQuery: fetchCreatePoolSimulation } = queryFactory({
  queryKey: ({
    network,
    factory,
    implementationIndex,
    wasmHash,
    account,
    coins,
    amplification,
    fee,
    feeMultiplier,
    priceOracleAveragingWindow,
    poolName,
    symbol,
  }: CreatePoolParams) =>
    ({
      name: 'deploy_plain_pool',
      network,
      factory,
      implementationIndex,
      wasmHash,
      account,
      coins,
      amplification,
      fee,
      feeMultiplier,
      priceOracleAveragingWindow,
      poolName,
      symbol,
    }) as const,
  queryFn: async (params: CreatePoolQuery) => {
    const {
      network,
      factory,
      account,
      coins,
      poolName,
      symbol,
      amplification,
      fee,
      feeMultiplier,
      priceOracleAveragingWindow,
      wasmHash,
    } = params
    return simulateContractCall<{ pool: StellarContract }>(
      network,
      factory,
      'deploy_plain_pool',
      [
        account,
        encodeContractValue(
          {
            name: poolName,
            symbol,
            coins,
            amplification: BigInt(assert(amplification, 'Enter amplification')),
            // Percent values use eight decimal places to reach the contract's 1e10 fee scale.
            fee: BigInt(toWei(assert(fee, 'Enter a swap fee'), STELLAR_POOL_LIMITS.fee.decimals)),
            offpeg_fee_multiplier: BigInt(
              toWei(
                assert(feeMultiplier, 'Enter a dynamic fee multiplier'),
                STELLAR_POOL_LIMITS.feeMultiplier.decimals,
              ),
            ),
            ma_exp_time: BigInt(assert(priceOracleAveragingWindow, 'Enter an oracle averaging window')),
            wasm_hash: Uint8Array.from(wasmHash),
            // stellar port supports plain coins only (asset type 0), no external rate-oracle methods or addresses
            asset_types: coins.map(() => 0),
            methods: [],
            oracles: [],
          },
          PARAMETER_TYPES,
        ),
      ],
      account,
    )
  },
  validationSuite: createPoolValidationSuite,
  category: 'stellar.transaction',
})
