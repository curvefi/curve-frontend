import { formatUnits, parseAbi } from 'viem'
import { getWagmiConfig } from '@evm-ui/features/connect-wallet/lib/wagmi/wagmi-config'
import type { ChainParams } from '@evm-ui/queries/root-keys'
import { chainValidationGroup } from '@evm-ui/queries/validation/chain-validation'
import { userAddressValidationGroup } from '@evm-ui/queries/validation/evm-address-validation'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'
import type { Range } from '@ui/features/queries/util'
import { decimal } from '@ui/lib/decimal'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { readContracts } from '@wagmi/core'

const RISK_ABI = parseAbi([
  'function price_oracle() view returns (uint256)',
  'function user_prices(address user) view returns (uint256[2])',
  'function health(address user, bool full) view returns (int256)',
])

type PositionRiskParams = ChainParams & {
  userAddress: Address
  controllerAddress: Address
  ammAddress: Address
}

export type PositionRisk = {
  oracle: Decimal
  /** Index 0 is the lower boundary and index 1 is the upper boundary. */
  prices: Range<Decimal>
  fullHealth: Decimal
}

const formatSignedUnits = (value: bigint) => {
  const negative = value < 0n
  const text = formatUnits(negative ? -value : value)
  return `${negative ? '-' : ''}${text}`
}

/**
 * Oracle, user range, and Controller health(full) for one position.
 * These reads use the market chain directly. The shared LlamaLend API instance only serves the page chain.
 */
export const { getQueryOptions: getPositionRiskOptions } = queryFactory({
  queryKey: ({ chainId, userAddress, controllerAddress, ammAddress }: PositionRiskParams) =>
    ['llamalend', 'position-risk', { chainId, userAddress, controllerAddress, ammAddress }] as const,
  queryFn: async ({ chainId, userAddress, controllerAddress, ammAddress }: PositionRiskParams): Promise<PositionRisk> => {
    const config = getWagmiConfig()
    if (!config) throw new Error('Chain client is not ready')
    const [oracle, prices, health] = await readContracts(config, {
      allowFailure: false,
      contracts: [
        { address: ammAddress, abi: RISK_ABI, functionName: 'price_oracle', chainId },
        { address: controllerAddress, abi: RISK_ABI, functionName: 'user_prices', args: [userAddress], chainId },
        { address: controllerAddress, abi: RISK_ABI, functionName: 'health', args: [userAddress, true], chainId },
      ],
    })
    const [contractUpper, contractLower] = prices
    const oraclePrice = decimal(formatUnits(oracle))
    const lower = decimal(formatUnits(contractLower))
    const upper = decimal(formatUnits(contractUpper))
    const fullHealth = decimal(formatSignedUnits(health * 100n))
    if (oraclePrice == undefined || lower == undefined || upper == undefined || fullHealth == undefined) {
      throw new Error('Position risk read could not be parsed')
    }
    return { oracle: oraclePrice, prices: [lower, upper], fullHealth }
  },
  validationSuite: createValidationSuite((params: PositionRiskParams) => {
    chainValidationGroup(params)
    userAddressValidationGroup(params)
  }),
  category: 'llamalend.user',
})
