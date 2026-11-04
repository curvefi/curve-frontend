import { formatUnits, parseAbi } from 'viem'
import { getWagmiConfig } from '@evm-ui/features/connect-wallet/lib/wagmi/wagmi-config'
import {
  type UserContractParams,
  type UserContractQuery,
  userContractValidationSuite,
} from '@evm-ui/queries/validation/user-contract-validation'
import { requireChainId } from '@evm-ui/utils'
import type { Decimal } from '@primitives/decimal.utils'
import { assert } from '@primitives/objects.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { readContracts } from '@wagmi/core'

const controllerAbi = parseAbi([
  'function loan_discount() view returns (uint256)',
  'function liquidation_discounts(address) view returns (uint256)',
  'function extra_health(address) view returns (uint256)',
])

const toPercent = (discount: bigint) => formatUnits(discount * 100n, 18) as Decimal

/** The user's discounts in percent, reading the controller as the market list has positions on every chain. */
export const { getQueryOptions: getUserMarketDiscountsOptions } = queryFactory({
  queryKey: ({ userAddress, contractAddress, blockchainId }: UserContractParams) =>
    ({ name: 'getUserMarketDiscounts', blockchainId, contractAddress, userAddress }) as const,
  queryFn: async ({ userAddress, contractAddress, blockchainId }: UserContractQuery) => {
    const config = assert(getWagmiConfig(), 'Wagmi config is not ready')
    const controller = { address: contractAddress, abi: controllerAbi, chainId: requireChainId(blockchainId) }
    const [[loanDiscount, liquidationDiscount], [{ result: extraHealth = 0n }]] = await Promise.all([
      readContracts(config, {
        allowFailure: false,
        contracts: [
          { ...controller, functionName: 'loan_discount' },
          { ...controller, functionName: 'liquidation_discounts', args: [userAddress] },
        ],
      }),
      // Controllers without deleverage support have no extra health
      readContracts(config, { contracts: [{ ...controller, functionName: 'extra_health', args: [userAddress] }] }),
    ])
    return { loanDiscount: toPercent(loanDiscount + extraHealth), liquidationDiscount: toPercent(liquidationDiscount) }
  },
  category: 'llamalend.user',
  validationSuite: userContractValidationSuite,
})
