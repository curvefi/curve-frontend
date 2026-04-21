import { getAddress, type Address } from 'viem'
import type { Chain } from '@curvefi/prices-api'
import { getPoolFilters } from '@curvefi/prices-api/chains'
import { EmptyValidationSuite, type QueryData } from '@ui-kit/lib'
import { queryFactory, type ChainNameParams } from '@ui-kit/lib/model'
import { mapQuery } from '@ui-kit/types/util'

// List from api.curve.finance: https://raw.githubusercontent.com/curvefi/curve-api/eed5dd84492b3e5611a34504a98bc1fa256defa5/routes/v1/getHiddenPools.js
// List for core api https://github.com/curvefi/curve-api-core/blob/ab4080c816438c9c97d0baab82ad939aabb9bc85/routes/v1/getHiddenPools.js

// We allow blocking more than just the chains supported by prices api.
type ChainBlacklist =
  | Chain
  | 'avalanche'
  | 'moonbeam'
  | 'kava'
  | 'xdc'
  | 'tac'
  | 'etherlink'
  | 'plume'
  | 'unichain'
  | 'monad'

/**
 * A local hardcoded blacklist of pools we don't want to show in the front-end for whatever reason.
 * This will be in addition to the list of pools blacklisted by the Prices API endpoint.
 */
const blacklist: Partial<Record<ChainBlacklist, Address[]>> = {
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

    // List from api.curve.finance
    '0x1F71f05CF491595652378Fe94B7820344A551B8E', // factory-v2-0 - non pegged andre boo boo
    '0x621F13Bf667207335C601F8C89eA5eC260bAdA9A', // factory-v2-4 - scrv doesnt exist
    '0x6c7Fc04FEE277eABDd387C5B498A8D0f4CB9C6A6', // factory-v2-6 - old cvxcrv pool
    '0x99AE07e7Ab61DCCE4383A86d14F61C68CdCCbf27', // factory-v2-8 - by team request
    '0x2De8c952871317fB9F22C73BB66BF86A1EeBe1a5', // factory-v2-36 - by team request
    '0x2009f19A8B46642E92Ea19adCdFB23ab05fC20A6', // factory-v2-15 - ruler dead
    '0x883F7d4B6B24F8BF1dB980951Ad08930D9AEC6Bc', // factory-v2-17 - ruler dead
    '0x46f5ab27914A670CFE260A2DEDb87f84c264835f', // factory-v2-18 - ruler dead
    '0x2206cF41E7Db9393a3BcbB6Ad35d344811523b46', // factory-v2-19 - ruler dead
    '0x6d0Bd8365e2fCd0c2acf7d218f629A319B6c9d47', // factory-v2-26 - never seeded
    '0x66b2e9B25F8ABa6B4A10350c785d63bAdE5A11E9', // factory-v2-39 - broken non pegged
    '0xE76ebD4f9FA58E5269D3cD032b055b443239e664', // factory-v2-40 - broken non pegged
    '0x705DA2596cf6aaA2FEA36f2a59985EC9e8aeC7E2', // factory-v2-46 - non pegged
    '0x9fED7a930d86Dfe5980040E18C92B1B0d381eC19', // factory-v2-54 - duplicate
    '0x3a70DfA7d2262988064A2D051dd47521E43c9BdD', // factory-v2-81 - outdated, team asked to hide it
    '0xD652c40fBb3f06d6B58Cb9aa9CFF063eE63d465D', // factory-v2-103 - broken
    '0xE667c793513ecBD74Fb53Bb4b91fDae02BFC092D', // factory-v2-65 - non pegged
    '0x03470B57B05089EE40c651dAC9E0387F1f3cb46f', // factory-crypto-0 - price borked
    '0x6ec176b5449DD7C1a87CA8d97aceCC531C0Ca0d8', // factory-crypto-1 - price borked
    '0x1667954F14F5b22c703116D8d806f988B1e09018', // factory-crypto-2 - price borked
    '0xB2E113a6B8edeA086A44B1509013C4Fc69eC4bf0', // factory-crypto-49 - broken
    '0xB0973f4FB4e1280D6bDDBa5b18aE00576a6E78f4', // factory-crypto-265 - broken
    '0x89845EA574605E2E860d749ce15049a64b1d4D20', // factory-stable-ng-69 - broken
    '0x18c28D2f00ef6D35dc5F9A7E141Da0aCfe826903', // factory-stable-ng-405 - offensive
    '0x2ac53aC4d9Cf45E108383fE47fFD9513942d4ceb', // factory-stable-ng-406 - offensive
    '0xeE86CfD3e4C7f6aee04044668f4476765be2053b', // factory-twocrypto-154 - offensive
    '0xB961628dF82AdBf48656aDdF0438030B80EaA116', // factory-twocrypto-155 - offensive
    '0xb895B08314333b956D6fA26D9633e560edf070B6', // factory-twocrypto-156 - offensive
    '0xF6CE3a882252933e60603BcdD5796790311d31D1', // factory-twocrypto-200 - offensive
    '0xc01728062fA40733035C30478B01e262024f0725', // factory-tricrypto-53 - offensive
    '0xe7aD02A4c9323a644Db7856E486447E68705FDFf', // factory-tricrypto-54 - offensive
    '0x467FAE5DA5B64de294A8cB9354fcd25de7355C0A', // factory-tricrypto-55 - offensive
    '0x4c0C38ff18256E046012e0980F2a2f32bE0C8deA', // factory-tricrypto-56 - offensive
    '0x1df759511FeBf10C6AE3a30Ccf2da4c81CdF05C1', // factory-tricrypto-71 - offensive
    '0x1FAdFC52102988DAdEbafb79F191281A334d1404', // factory-twocrypto-274 - duplicate and empty
    '0x5b1A6c378c22e106A79EBF31907EBb17673B6718', // factory-twocrypto-275 - duplicate and empty
    '0x349d27E78B3267180279687bf82caE3BD78F41e1', // factory-twocrypto-279 - IDRS token has broken balanceOf
    '0x771c91e699B4B23420de3F81dE2aA38C4041632b', // factory-stable-ng-506 - Team asked to hide, pool will not used
    '0x184F3Fed33D4194A5603C14481241BD089268e4b', // factory-stable-ng-685 - Team asked to hide
  ],
  arbitrum: [
    '0x15FB53Cb126140dfbfDED07d0057E1896B2dbCa3', // factory-stable-ng-206 - Unitos.net/USDT - scam pool pretending to be USDT

    // List from api.curve.finance
    '0xE9dcF2d2A17eAD11fab8b198578B20535370Be6a', // factory-v2-1 - duplicate MIM pool
    '0x6041631c566Eb8dc6258A75Fa5370761d4873990', // factory-v2-3 - non pegged pool
    '0x850c7cC8757CE1fa8CeD709f297D842E12E61759', // factory-v2-5 - empty non pegged pool?
    '0x065f44Cd602Cc6680E82E516125839b9BbbbE57e', // factory-v2-6 - empty non pegged pool?
    '0xc1796710a28f1cBbFE1e8a79A65eE96446607a47', // factory-v2-18 - by team request
    '0xf3b9DDB3132543E06349AFF9A12f8503D4ca5b47', // factory-v2-14 - non pegged pool
    '0x8c0E0cC1D66a1b1fF10EBB1D99Bb9779311d6dE6', // factory-v2-25 - wrong implementation
    '0xe5042bbac35056f3f95bF0a79D9eB64dc0daFDb8', // factory-v2-42 - broken
    '0x644A1419832298Ac7e3d7Ca48E9122E103887969', // factory-stable-ng-212 - redeployed, team asked to hide it
  ],
  polygon: [
    // List from api.curve.finance
    '0x82f1534324e60581e693335dC39b569DC7605af5', // factory-v2-0 - Test pools not meant to be useful
    '0x4356a01C4F873ae8fA46E1d2cFAEE249560c5e6e', // factory-v2-1 - Test pools not meant to be useful
    '0x10f38a56720fF3A16bD04754e9b49E1f39d4aA4a', // factory-v2-2 - Test pools not meant to be useful
    '0x4a3Bb45aee36367FabFbc5E2aC5F92b06eD2Dba5', // factory-v2-3 - non pegged
    '0x78A8cC2A24FcC5B358Bb8A371072403CE092D599', // factory-v2-6 - duplicate
    '0xf4d5F7fD2d80d6d535a76D3543F3e5602641Fc7E', // factory-v2-8 - non pegged
    '0x32d14D697eaF6c254A08DDaC1aA5e6Ed89AB32b9', // factory-v2-13 - non pegged
    '0x2b58cA1650DCc27Ae2Ab879fD3527b950009472a', // factory-v2-35 - by request (charlie)
    '0x30509e776cE04c32c08F1EA1Ee68A5fc09a02884', // factory-v2-94 - duplicate and empty
    '0x19606dBD974f56368d0799f97f0D17eA96E05b97', // factory-v2-95 - duplicate and empty
    '0x18348260e82255A0bB1FFdF8AEb70AD9e0Cc4A06', // factory-v2-96 - duplicate and empty
    '0xf0BacB69af7063B83998e2a021dAeF17DAD8509D', // factory-v2-97 - duplicate and empty
    '0xdA69581F7C5E0eEa92E8cDd89908352241aAE4FE', // factory-v2-98 - duplicate and empty
    '0x5f042956B935BB3B1498f488884792cc4299D85A', // factory-v2-99 - duplicate and empty
    '0x42685233E0f20C2477bAE4345f4218D0eedAf3eD', // factory-v2-106 - duplicate and empty
    '0x8914B29F7Bea602A183E89D6843EcB251D56D07e', // factory-v2-113 - duplicate and empty
    '0xe4A51084f2b682f051BC31715A271d9e84AC0FfA', // factory-v2-118 - duplicate and empty
    '0xDee7Ac2510f2dA213f4CCFC3391dC5dde9658DfC', // factory-v2-119 - duplicate and empty
    '0x600CD1aec3f8D3b1E8673f2d5Ec569feadabf345', // factory-v2-120 - duplicate and empty
    '0x6CDA7AE2Ce3E6995E4f038BdCAA9F3319dC00f16', // factory-v2-121 - duplicate and empty
    '0x3da78d5C0EA557C28B4dC92A6629ABb03dC6dC7D', // factory-v2-122 - duplicate and empty
    '0xD121821cf14Afd5017F252Ec55Bbe093A77b732a', // factory-v2-123 - duplicate and empty
    '0x3EaA26a2335F745cb9F5FF3841d1522BB8522AbF', // factory-v2-124 - duplicate and empty
    '0x3ebA4c36ECa3E6443cfC1DadC5A05Ff94d249a08', // factory-v2-125 - duplicate and empty
    '0x488124476E932A196A8EB547393A8b0b9d50Ca35', // factory-v2-127 - duplicate and empty
    '0x09992D921e118C8e70De260E74A5BC142234A031', // factory-v2-128 - duplicate and empty
    '0xc948e1Fa13101aC6Efb3d5211e723092cA69e7Ad', // factory-v2-129 - duplicate and empty
    '0x8cd3B45a93b8Bd87c11aAFCDcF7f96626c5e1D6A', // factory-v2-130 - duplicate and empty
    '0x120Ee0D780f90F974250c9b14956702c1a4eE584', // factory-v2-131 - duplicate and empty
    '0x3a2BeA29CB51975Ba337dd6ABf89a5F7D68f8EB7', // factory-v2-132 - duplicate and empty
    '0x4808064427fee6b44f087Ac6d31E9E865C005d41', // factory-v2-134 - duplicate and empty
  ],
  avalanche: [
    // List from api.curve.finance
    '0xe5042bbac35056f3f95bF0a79D9eB64dc0daFDb8', // factory-v2-42 - empty/borked
    '0x5Aa2a79293424bf39171d704A364FDE3B641DB25', // factory-v2-47 - empty/borked
  ],
  moonbeam: [
    // List from api.curve.finance
    '0xd937afa3E51aAc92FD6B4c9F487D7B9D52Fd7417', // factory-v2-5 - spam
  ],
  kava: [
    // List from api.curve.finance
    '0xD13282396f716A29C1a1370832a635F54581f917', // factory-v2-1 - typo in name
  ],
  xdai: [
    // List from api.curve.finance
    '0x149bF4A7e0561D38Db264B973225dAA7209A7d20', // factory-v2-12
  ],
  fantom: [
    '0x4560262B27655C9C2978b030CCF7815777D7A3f1', // old eywa pool
    '0xF1CD9A305b71A2EAaE9cBC57e0e11A1e214f7219', // old eywa pool
    '0x530181Da01cE115559e11bb675FB296f42aBE262', // CrossCurve crvUSDT
    '0xf211FAeB742c6f7c4b0a97b7bBc98393BfefEF53', // CrossCurve
    '0x6857Fb7B589A319D9c3DB71178f58eaA8A4dc89E', // CrossCurve
    '0x942Eb70Cfe56dA24F0f2163e924E00ed31EE4290', // CrossCurve

    // List from api.curve.finance
    '0xaD9c5054CC31f8AA822AEb9247298D2Ecf48c5cf', // factory-v2-2 - Exact duplicate of another facto pool, with 0 liquidity
    '0x259303442a9772222856C9Ae5212051048Bd3D9D', // factory-v2-5 - non stable pool
    '0x36586206bFc13ED520597b3DAE1313C8b1496388', // factory-v2-12 - non stable pool
  ],
  base: [
    '0xfFE0dcdB7085508a3c32931973bd2dC77dF30Caa',
    '0x98f6Fd72D68D4B550C89A7096ed28f090a1A49fC',

    // List from api.curve.finance
    '0x8E01c9848d2e9bE59793eb0f262F38519442F3bb', // factory-crypto-0
    '0xeC6a886148B38C233B07cc6732142dccaBF1051D', // factory-tricrypto-0
  ],
  hyperliquid: [
    // List from api.curve.finance
    '0x355d85d00FC76B1d09Fc746E394FA0E59f308861', // factory-stable-ng-6 - test pool, team asked to hide it
    '0xB7b1bc9E42A80C6defd93b62ddd69f533E1464B5', // factory-stable-ng-11 - test pool, team asked to hide it
    '0xD62df456EC376Fa0cdfC20C721DAe5469d093177', // factory-stable-ng-26 - redeployed, team asked to hide it
  ],
  xdc: [
    // List from core api
    '0x826c3Bb33cE1C5360E15dC08d311E30db3acdF20', // test pool, team asked to hide it
  ],
  tac: [
    // List from core api
    '0x2124959EEd1331A0a0E527e16CDa06E7068a7854', // pool redeployed, team asked to hide it
    '0x425C634Af06e28aeda4cbD1da0Bee2a71cA6fC75', // pool redeployed, team asked to hide it
    '0xC981eB4b4fF59d1899AD91fa3d60568fBCe9699d', // pool redeployed, team asked to hide it
    '0x89B5a78f2e47ACB3aE8C83a4676C6af335355eCB', // pool redeployed, team asked to hide it
    '0x9600B761C9f219c6A4C6567B0F1400F2CE6265b8', // team asked to hide it
    '0xc6e7c8DC7414C28C67de0238393e50431De83a69', // team asked to hide it
  ],
  etherlink: [
    // List from core api
    '0x0Eac4526321866178c6444f0a211A21DB4a0Ed4C', // wrong deployed pool, team asked to hide
  ],
  plume: [
    // List from core api
    '0x6eCD9991764988ba2c9023A8Bb7a2b320624dB09', // spam
    '0x557118Aec9EB7218d81E35eF47BB9D9257ED99A5', // spam
    '0x9F5D9a5d2926998bA6E80eF0964735B1DCB33B43', // spam
    '0xd1831677Fd527C93e6f20821Aa85507Fe329C1C9', // spam
    '0xd3A6ebAcA9035997BeA0A905958De0cE09ed9471', // spam
    '0xE1dd3Bb5871C414062545562e85AB1b8e1c90d5D', // spam
  ],
  unichain: [
    // List from core api
    '0xbaBE778ef6aCE022f62e8fAee312D80E3C1D1e13', // wrong deployed pool
  ],
  monad: [
    // List from core api
    '0x0Eac4526321866178c6444f0a211A21DB4a0Ed4C', // Team asked to hide
    '0x95aF759ec2f4385EdBbBA959A8a1CDc65610D080', // Team asked to hide
    '0x576AB9325FdC1ade3c02d09E1882C0385e353cfe', // Pool deployed incorrectly
    '0xE6Bca8B387a79B226897379645700e37b8055D53', // Pool deployed incorrectly, team asked to hide
  ],
} as const

const { useQuery: usePricesApiBlacklist, fetchQuery: fetchPricesApiBlacklist } = queryFactory({
  queryKey: () => ['pools-blacklist'] as const,
  queryFn: async () => await getPoolFilters(),
  validationSuite: EmptyValidationSuite,
  category: 'dex.poolParams',
})

const getBlacklist = (blacklistPricesApi: QueryData<typeof usePricesApiBlacklist>, blockchainId: ChainBlacklist) =>
  [
    ...(blacklist[blockchainId] ?? []),
    ...blacklistPricesApi.filter(({ chain }) => chain === blockchainId).map(({ address }) => address),
  ].map((address) => getAddress(address)) // just to be sure there's no missing checksums from the prices api

export const usePoolsBlacklist = ({ blockchainId }: ChainNameParams) =>
  mapQuery(usePricesApiBlacklist({}), (blacklist) => (blockchainId ? getBlacklist(blacklist, blockchainId) : undefined))

export const fetchPoolsBlacklist = async ({ blockchainId }: ChainNameParams) =>
  blockchainId ? getBlacklist(await fetchPricesApiBlacklist({}), blockchainId) : []
