import { createValidationSuite } from '@ui-kit/lib'
import { queryFactory, rootKeys, type ChainParams, type ChainQuery } from '@ui-kit/lib/model'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { Chain } from '@ui-kit/utils'

/**
 * A local hardcoded blacklist of pools we don't want to show in the front-end for whatever reason.
 * This will be in addition to the list of pools blacklisted by the Prices API endpoint.
 */
const blacklist: Partial<Record<Chain, string[]>> = {
  [Chain.Ethereum]: [
    'weth-llamma',
    'sfrxeth-llamma',
    'pax',
    'busd',
    'y',
    'factory-v2-267',
    'factory-v2-332', // CRVUSD/STUSDT
    'factory-v2-348', // PYUSD/crvUSD
    'factory-v2-349', // crvUSD/PYUSD
    'factory-v2-350', // crvUSD/PYUSD
    'factory-v2-233', // Adamant Dollar
    'factory-stable-ng-13', // USDV-3crv
    'factory-stable-ng-21', // weETH/WETH
    'factory-v2-370', // PRISMA/yPRISMA
  ],
  [Chain.Fantom]: [
    'factory-v2-137', // old eywa pool
    'factory-v2-140', // old eywa pool
    'factory-stable-ng-12', // CrossCurve crvUSDT
    'factory-stable-ng-13', // CrossCurve
    'factory-stable-ng-14', // CrossCurve
    'factory-stable-ng-15', // CrossCurve
  ],
  [Chain.Base]: ['factory-v2-4', 'factory-v2-5'],
} as const

/** Gets a list of all blacklisted pool addresses. */
export const { useQuery: usePoolsBlacklist, fetchQuery: fetchPoolsBlacklist } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => [...rootKeys.chain({ chainId }), 'pools-blacklist'] as const,
  queryFn: async ({ chainId }: ChainQuery) => Promise.resolve(blacklist[chainId as Chain] ?? []),
  validationSuite: createValidationSuite((params: ChainParams) => {
    chainValidationGroup(params)
  }),
})
