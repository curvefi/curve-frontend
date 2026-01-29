import type { Address } from 'viem'
import type { Chain } from '@curvefi/prices-api'
import * as Api from '@curvefi/prices-api/chains'
import { createValidationSuite } from '@ui-kit/lib'
import { queryFactory, rootKeys, type ChainNameParams, type ChainNameQuery } from '@ui-kit/lib/model'
import { chainNameValidationGroup } from '@ui-kit/lib/model/query/chain-name-validation'

/**
 * A local hardcoded blacklist of pools we don't want to show in the front-end for whatever reason.
 * This will be in addition to the list of pools blacklisted by the Prices API endpoint.
 */
const blacklist: Partial<Record<Chain, Address[]>> = {
  ethereum: [
    '0x06364f10B501e868329afBc005b3492902d6C763', // pax
    '0x79a8C46DeA5aDa233ABaFFD40F3A0A2B1e5A4F27', // busd
    '0x45F783CCE6B7FF23B2ab2D70e416cdb7D6055f51', // y
    '0xC61557C5d177bd7DC889A3b621eEC333e168f68A', // REUSD/3Crv,
    '0xa089A831DEc6dfddfd54659ea42C02083f9352d6', // CRVUSD/STUSDT
    '0xC1E894613A404A49c4200FCE3F7D3F29918d2b93', // PYUSD/crvUSD
    '0x7Dc1A7298347c2F6270d07a464bD4d6Dab2544E8', // crvUSD/PYUSD
    '0xe5513b15EA0449D26781B0Ef4f4E5040c9D3459D', // crvUSD/PYUSD
    '0x84997FAFC913f1613F51Bb0E2b5854222900514B', // Adamant Dollar
    '0x1a5C82B77cE33Cf5ce87efE5eCdb33f7591B35aa', // USDV-3crv
    '0xC13E07b6d204F638D5Ca803c12cb71e2F5416755', // weETH/WETH
    '0xC2d54fFb8a61e146110d2fBdD03b12467Fe155ac', // PRISMA/yPRISMA
  ],
  fantom: [
    '0x4560262B27655C9C2978b030CCF7815777D7A3f1', // old eywa pool
    '0xF1CD9A305b71A2EAaE9cBC57e0e11A1e214f7219', // old eywa pool
    '0x530181Da01cE115559e11bb675FB296f42aBE262', // CrossCurve crvUSDT
    '0xf211FAeB742c6f7c4b0a97b7bBc98393BfefEF53', // CrossCurve
    '0x6857Fb7B589A319D9c3DB71178f58eaA8A4dc89E', // CrossCurve
    '0x942Eb70Cfe56dA24F0f2163e924E00ed31EE4290', // CrossCurve
  ],
  base: ['0xfFE0dcdB7085508a3c32931973bd2dC77dF30Caa', '0x98f6Fd72D68D4B550C89A7096ed28f090a1A49fC'],
} as const

/** Gets a list of all blacklisted pool addresses. */
export const { useQuery: usePoolsBlacklist, fetchQuery: fetchPoolsBlacklist } = queryFactory({
  queryKey: ({ blockchainId }: ChainNameParams) =>
    [...rootKeys.chainName({ blockchainId }), 'pools-blacklist'] as const,
  queryFn: async ({ blockchainId }: ChainNameQuery) => {
    const blacklistPricesApi = (await Api.getPoolFilters())
      .filter(({ chain }) => chain === blockchainId)
      .map(({ address }) => address)

    return [...(blacklist[blockchainId] ?? []), ...blacklistPricesApi]
  },
  validationSuite: createValidationSuite((params: ChainNameParams) => {
    chainNameValidationGroup(params)
  }),
})
