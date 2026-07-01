/**
 * Static lookup for pools that should show the Vyper reentrancy vulnerability warning.
 *
 * This is checked in as data because the incident set is historical and closed; it
 * should not grow at runtime. The beta pool list only receives prices-api pool rows,
 * where `vyperVersion` is too broad and creates false positives. For example, some
 * non-affected pools were compiled with Vyper 0.2.15.
 *
 * The list was generated once from @curvefi/api's `pool.hasVyperVulnerability()`
 * result for the chain ids below. To produce it, curve-js was initialized with
 * NoRPC per chain, the factory registries were loaded (`factory`,
 * `cryptoFactory`, `twocryptoFactory`, `crvUSDFactory`, `tricryptoFactory`,
 * `stableNgFactory`), then `curve.getPoolList()` was filtered to pools where
 * `pool.hasVyperVulnerability()` returned true. In curve-js, that method
 * delegates to `checkVyperVulnerability(chainId, poolId, implementation)`,
 * which returns true for explicit legacy pool-id exceptions (`1:crveth`,
 * `42161:tricrypto`) or when a pool uses one of the vulnerable factory
 * implementation addresses known for the historical exploit.
 *
 * Entries below are pool contract addresses keyed by chainId. They are not Vyper
 * versions and they are not implementation addresses.
 */

export const VYPER_VULNERABLE_POOL_ADDRESS_LOOKUP: Partial<Record<number, Readonly<Record<string, true>>>> = {
  // Ethereum (1)
  1: {
    // factory-v2-155 - frxETH - 0x6326debbaa15bcfe603d831e7d75f4fc10d9b43e
    '0x7c0316c925e12ebfc55e0f325794b43ead425157': true,
    // factory-v2-165 - cbETH - 0x6326debbaa15bcfe603d831e7d75f4fc10d9b43e
    '0x6e8d2b6fb24117c675c2fabc524f28cc5d81f18a': true,
    // factory-v2-166 - aETH - 0x6326debbaa15bcfe603d831e7d75f4fc10d9b43e
    '0xc22936d5ece78c048d6e7fe5d9f77fb6caa16dbb': true,
    // factory-v2-179 - Frax Ether - 0x6326debbaa15bcfe603d831e7d75f4fc10d9b43e
    '0xcf95ac3daecdbf60152a16bda8d8f8db7d175b88': true,
    // factory-v2-193 - pETH - 0x6326debbaa15bcfe603d831e7d75f4fc10d9b43e
    '0x904be3ce7249447167051f239c832400ca28de71': true,
    // factory-v2-194 - pETH - 0x6326debbaa15bcfe603d831e7d75f4fc10d9b43e
    '0x9848482da3ee3076165ce6497eda906e66bb85c5': true,
    // factory-v2-252 - msETH - 0x6326debbaa15bcfe603d831e7d75f4fc10d9b43e
    '0xc897b98272aa23714464ea2a0bd5180f1b8c0025': true,
    // factory-v2-278 - frxETHt - 0x6326debbaa15bcfe603d831e7d75f4fc10d9b43e
    '0x428d03774f976f625380403e0c0ad38980943573': true,
    // factory-v2-38 - alETH - 0x6326debbaa15bcfe603d831e7d75f4fc10d9b43e
    '0xc4c319e2d4d66cca4464c0c2b32c9bd23ebe784e': true,
    // factory-v2-56 - Ankr Reward-Earning Staked ETH - 0x6326debbaa15bcfe603d831e7d75f4fc10d9b43e
    '0xfb9a265b5a1f52d97838ec7274a0b1442efacc87': true,
  },
  // Polygon (137)
  137: {
    // factory-v2-204 - LATAM Peso - 0xae00f57663f4c85fc948b13963cd4627daf01061
    '0xcdb4f70ad54940cfe42f4a74e34c2a965ae66931': true,
    // factory-v2-235 - DFYN - 0xae00f57663f4c85fc948b13963cd4627daf01061
    '0x4f608b34e6ed644e69fbbd5c703727398996bf70': true,
    // factory-v2-237 - TESTABC + TESTZRX - 0xae00f57663f4c85fc948b13963cd4627daf01061
    '0xbe775deb31b4ee5841a8b4564c9f3294987023fe': true,
    // factory-v2-242 - csMATIC + MATIC - 0xae00f57663f4c85fc948b13963cd4627daf01061
    '0x3945e96676a6ddb585c6bc88acb53d2c34e799cd': true,
    // factory-v2-243 - csMATIC + MATIC - 0xae00f57663f4c85fc948b13963cd4627daf01061
    '0x6ffa69b570d169317ec8d619ae6fa2d662a03d28': true,
    // factory-v2-288 - MaticX/WMATIC - 0xae00f57663f4c85fc948b13963cd4627daf01061
    '0xca409f7c21e970411e9a5b163bbf82d21c175274': true,
    // factory-v2-385 - MATIC/EMI - 0xae00f57663f4c85fc948b13963cd4627daf01061
    '0x6937e4377922f71d5ebe2323b59e862ca11d6ac0': true,
    // factory-v2-386 - MATIC/EMI - 0xae00f57663f4c85fc948b13963cd4627daf01061
    '0x67c728561fbf6272b03c567a0c757ea71602fddd': true,
    // factory-v2-387 - MATIC/EMI - 0xae00f57663f4c85fc948b13963cd4627daf01061
    '0x39416bea4ef71f8f9ce1735299a5ab43e14cee2d': true,
  },
  // Fantom (250)
  250: {
    // factory-v2-135 - My aFTM Pool - 0xe6358f6a45b502477e83cc1cda759f540e4459ee
    '0x31d8f85bce2a4a096a2d207f8f113d1c3fec7c06': true,
    // factory-v2-42 - Topshelf FTML - 0xe6358f6a45b502477e83cc1cda759f540e4459ee
    '0x8b63f036f5a34226065bc0a7b0ae5bb5eba1ff3d': true,
  },
  // Arbitrum (42161)
  42161: {
    // factory-v2-10 - Eleven.finance - 0x7da64233fefb352f8f501b357c018158ed8aa455
    '0xc120ef573752aad82484ebc9a752dad6f3fec54b': true,
    // factory-v2-15 - deBridge-ETH - 0x7da64233fefb352f8f501b357c018158ed8aa455
    '0x0a824b5d4c96ea0ec46306efbd34bf88fe1277e0': true,
    // factory-v2-61 - ETHMAXY/ETH - 0x7da64233fefb352f8f501b357c018158ed8aa455
    '0xd39016475200ab8957e9c772c949ef54bda69111': true,
    // factory-v2-62 - ETHMAXY/ETH - 0x7da64233fefb352f8f501b357c018158ed8aa455
    '0x305fc0a3eed959a3bbdc54300a1a140925b4b058': true,
    // tricrypto - tricrypto - null
    '0x960ea3e3c7fb317332d990873d354e18d7645590': true,
  },
  // Avalanche (43114)
  43114: {
    // factory-v2-33 - Topshelf AVAXL - 0x64448b78561690b70e17cbe8029a3e5c1bb7136e
    '0x445109bcf194c538b73ea60c71bb773849bc9b79': true,
  },
}

export const isVyperVulnerablePool = (chainId: number | undefined, poolAddress: string | undefined) =>
  chainId != null &&
  poolAddress != null &&
  VYPER_VULNERABLE_POOL_ADDRESS_LOOKUP[chainId]?.[poolAddress.toLowerCase()] === true
