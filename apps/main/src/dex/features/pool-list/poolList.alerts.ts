import { Chain } from '@primitives/network.utils'
import { maybes } from '@primitives/objects.utils'

/**
 * Static pool-address lookup for the Vyper vulnerability deposit warning.
 *
 * Compiled on 2026-07-01 with @curvefi/api/curve-js v2.69.7. Method: initialize
 * curve-js with NoRPC for each chain below, load the factory registries, filter
 * `curve.getPoolList()` by `pool.hasVyperVulnerability()`, and store matching
 * pool contract addresses in lowercase by chainId.
 *
 * `pool.hasVyperVulnerability()` delegates to curve-js
 * `checkVyperVulnerability(chainId, poolId, implementation)`, so this list is
 * based on known affected pool ids/implementations rather than `vyperVersion`.
 * Inline comments keep the curve-js pool id and display name for auditing.
 */

export const VYPER_VULNERABLE_POOL_ADDRESS_LOOKUP: Partial<Record<number, Readonly<Record<string, true>>>> = {
  [Chain.Ethereum]: {
    '0x7c0316c925e12ebfc55e0f325794b43ead425157': true, // factory-v2-155 - frxETH
    '0x6e8d2b6fb24117c675c2fabc524f28cc5d81f18a': true, // factory-v2-165 - cbETH
    '0xc22936d5ece78c048d6e7fe5d9f77fb6caa16dbb': true, // factory-v2-166 - aETH
    '0xcf95ac3daecdbf60152a16bda8d8f8db7d175b88': true, // factory-v2-179 - Frax Ether
    '0x904be3ce7249447167051f239c832400ca28de71': true, // factory-v2-193 - pETH
    '0x9848482da3ee3076165ce6497eda906e66bb85c5': true, // factory-v2-194 - pETH
    '0xc897b98272aa23714464ea2a0bd5180f1b8c0025': true, // factory-v2-252 - msETH
    '0x428d03774f976f625380403e0c0ad38980943573': true, // factory-v2-278 - frxETHt
    '0xc4c319e2d4d66cca4464c0c2b32c9bd23ebe784e': true, // factory-v2-38 - alETH
    '0xfb9a265b5a1f52d97838ec7274a0b1442efacc87': true, // factory-v2-56 - Ankr Reward-Earning Staked ETH
  },
  [Chain.Polygon]: {
    '0xcdb4f70ad54940cfe42f4a74e34c2a965ae66931': true, // factory-v2-204 - LATAM Peso
    '0x4f608b34e6ed644e69fbbd5c703727398996bf70': true, // factory-v2-235 - DFYN
    '0xbe775deb31b4ee5841a8b4564c9f3294987023fe': true, // factory-v2-237 - TESTABC + TESTZRX
    '0x3945e96676a6ddb585c6bc88acb53d2c34e799cd': true, // factory-v2-242 - csMATIC + MATIC
    '0x6ffa69b570d169317ec8d619ae6fa2d662a03d28': true, // factory-v2-243 - csMATIC + MATIC
    '0xca409f7c21e970411e9a5b163bbf82d21c175274': true, // factory-v2-288 - MaticX/WMATIC
    '0x6937e4377922f71d5ebe2323b59e862ca11d6ac0': true, // factory-v2-385 - MATIC/EMI
    '0x67c728561fbf6272b03c567a0c757ea71602fddd': true, // factory-v2-386 - MATIC/EMI
    '0x39416bea4ef71f8f9ce1735299a5ab43e14cee2d': true, // factory-v2-387 - MATIC/EMI
  },
  [Chain.Fantom]: {
    '0x31d8f85bce2a4a096a2d207f8f113d1c3fec7c06': true, // factory-v2-135 - My aFTM Pool
    '0x8b63f036f5a34226065bc0a7b0ae5bb5eba1ff3d': true, // factory-v2-42 - Topshelf FTML
  },
  [Chain.Arbitrum]: {
    '0xc120ef573752aad82484ebc9a752dad6f3fec54b': true, // factory-v2-10 - Eleven.finance
    '0x0a824b5d4c96ea0ec46306efbd34bf88fe1277e0': true, // factory-v2-15 - deBridge-ETH
    '0xd39016475200ab8957e9c772c949ef54bda69111': true, // factory-v2-61 - ETHMAXY/ETH
    '0x305fc0a3eed959a3bbdc54300a1a140925b4b058': true, // factory-v2-62 - ETHMAXY/ETH
    '0x960ea3e3c7fb317332d990873d354e18d7645590': true, // tricrypto
  },
  [Chain.Avalanche]: {
    '0x445109bcf194c538b73ea60c71bb773849bc9b79': true, // factory-v2-33 - Topshelf AVAXL
  },
}

export const isVyperVulnerablePool = (chainId: number | undefined, poolAddress: string | undefined) =>
  maybes(
    [chainId, poolAddress],
    (chainId, poolAddress) => VYPER_VULNERABLE_POOL_ADDRESS_LOOKUP[chainId]?.[poolAddress.toLowerCase()] === true,
  )
