import { decodeFunctionResult, encodeFunctionData, erc20Abi, isAddressEqual, maxUint128, parseAbi } from 'viem'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { assert, fromEntries } from '@primitives/objects.utils'
import { fromWei } from '@ui/lib/decimal'
import { type Config, getPublicClient, readContracts } from '@wagmi/core'

/** Uniswap v3 deployments on chains where Enso can redeem v3 positions and Curve has pools. */
const UNISWAP_V3: Record<number, { positionManager: Address; factory: Address }> = {
  1: {
    positionManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  },
  10: {
    positionManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  },
  137: {
    positionManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  },
  8453: {
    positionManager: '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1',
    factory: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
  },
  42161: {
    positionManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  },
}

export const getUniswapV3 = (chainId: number) => UNISWAP_V3[chainId]

/** Wallets rarely hold more open positions; it bounds the multicalls. */
const MAX_POSITIONS = 50

const positionManagerAbi = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
  'function positions(uint256 tokenId) view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)',
  'function getApproved(uint256 tokenId) view returns (address)',
  'function isApprovedForAll(address owner, address operator) view returns (bool)',
  'function decreaseLiquidity((uint256 tokenId, uint128 liquidity, uint256 amount0Min, uint256 amount1Min, uint256 deadline) params) returns (uint256 amount0, uint256 amount1)',
  'function collect((uint256 tokenId, address recipient, uint128 amount0Max, uint128 amount1Max) params) returns (uint256 amount0, uint256 amount1)',
  'function multicall(bytes[] data) returns (bytes[] results)',
])
const factoryAbi = parseAbi(['function getPool(address, address, uint24) view returns (address)'])
const poolAbi = parseAbi([
  'function slot0() view returns (uint160, int24 tick, uint16, uint16, uint16, uint8 feeProtocol, bool)',
  'function liquidity() view returns (uint128)',
])

type UniswapToken = { address: Address; symbol: string; decimals: number }

/** Amounts are in token units; `fees` are the uncollected trading fees, which the migration also moves. */
export type UniswapPosition = {
  id: string
  tokenId: string
  positionManager: Address
  pool: Address
  tokens: [UniswapToken, UniswapToken]
  /** Fee tier in hundredths of a bip, e.g. 500 = 0.05%. */
  fee: number
  tickLower: number
  tickUpper: number
  tick: number
  liquidity: string
  /** Liquidity active at the current tick, which shares the pool's trading fees. */
  poolLiquidity: string
  /** Share of trading fees left to LPs after the pool's protocol fee. */
  lpFeeShare: number
  amounts: [Decimal, Decimal]
  fees: [Decimal, Decimal]
}

/** Tokens the full withdrawal returns none of, as for one side of an out-of-range position. */
export const getEmptyTokens = ({ tokens, amounts, fees }: UniswapPosition) =>
  tokens.filter((_, i) => !(+amounts[i] + +fees[i])).map(({ address }) => address)

export const isInRange = ({ tick, tickLower, tickUpper }: UniswapPosition) => tickLower <= tick && tick < tickUpper

/**
 * v3 packs the protocol fee per token in `feeProtocol`: 1/n of the swap fee in the low 4 bits for token0, the high
 * 4 bits for token1, 0 when off. Swap direction is unknown, so both tokens weigh the same.
 */
const getLpFeeShare = (feeProtocol: number) =>
  [feeProtocol % 16, feeProtocol >> 4].reduce((share, n) => share - (n ? 1 / n / 2 : 0), 1)

/**
 * Estimated yearly fee APR, in percent, of a position that stays in range: in-range liquidity shares the pool's
 * fees pro rata, so the position earns its share of the 7-day average fees. Out of range it earns nothing.
 */
export const estimateUniswapFeeApr = (
  position: UniswapPosition,
  { volumeUsd7d, positionValueUsd }: { volumeUsd7d: number; positionValueUsd: number },
) => {
  if (!isInRange(position) || !positionValueUsd || !+position.poolLiquidity) return 0
  const share = Number(position.liquidity) / Number(position.poolLiquidity)
  const dailyFeesUsd = (volumeUsd7d / 7) * (position.fee / 1_000_000) * position.lpFeeShare
  return ((share * dailyFeesUsd * 365) / positionValueUsd) * 100
}

/** Price of token0 in token1 at a tick. */
export const tickToPrice = (tick: number, [token0, token1]: UniswapPosition['tokens']) =>
  1.0001 ** tick * 10 ** (token0.decimals - token1.decimals)

/**
 * Principal and uncollected fees, from simulating a full withdrawal as the owner:
 * `decreaseLiquidity` returns the principal and the `collect` after it returns principal plus fees.
 */
const simulateWithdrawal = async (
  config: Config,
  {
    chainId,
    owner,
    positionManager,
    tokenId,
    liquidity,
  }: { chainId: number; owner: Address; positionManager: Address; tokenId: bigint; liquidity: bigint },
) => {
  const client = assert(getPublicClient(config, { chainId }), `No client for chain ${chainId}`)
  const { result } = await client.simulateContract({
    account: owner,
    address: positionManager,
    abi: positionManagerAbi,
    functionName: 'multicall',
    args: [
      [
        encodeFunctionData({
          abi: positionManagerAbi,
          functionName: 'decreaseLiquidity',
          args: [
            {
              tokenId,
              liquidity,
              amount0Min: 0n,
              amount1Min: 0n,
              deadline: BigInt(Math.floor(Date.now() / 1000) + 600),
            },
          ],
        }),
        encodeFunctionData({
          abi: positionManagerAbi,
          functionName: 'collect',
          args: [{ tokenId, recipient: owner, amount0Max: maxUint128, amount1Max: maxUint128 }],
        }),
      ],
    ],
  })
  const [principal, total] = [
    decodeFunctionResult({ abi: positionManagerAbi, functionName: 'decreaseLiquidity', data: result[0] }),
    decodeFunctionResult({ abi: positionManagerAbi, functionName: 'collect', data: result[1] }),
  ]
  return { principal, fees: [total[0] - principal[0], total[1] - principal[1]] as const }
}

export async function fetchUniswapPositions(
  config: Config,
  chainId: number,
  owner: Address,
): Promise<UniswapPosition[]> {
  const uniswap = getUniswapV3(chainId)
  if (!uniswap) return []
  const { positionManager, factory } = uniswap
  const npm = { chainId, address: positionManager, abi: positionManagerAbi } as const

  const [count] = await readContracts(config, {
    allowFailure: false,
    contracts: [{ ...npm, functionName: 'balanceOf', args: [owner] }],
  })
  // Newest positions come last and are the likeliest to be open.
  const indexes = [...Array(Math.min(Number(count), MAX_POSITIONS)).keys()].map(i => Number(count) - 1 - i)
  const tokenIds = await readContracts(config, {
    allowFailure: false,
    contracts: indexes.map(
      index => ({ ...npm, functionName: 'tokenOfOwnerByIndex', args: [owner, BigInt(index)] }) as const,
    ),
  })
  const details = await readContracts(config, {
    allowFailure: false,
    contracts: tokenIds.map(tokenId => ({ ...npm, functionName: 'positions', args: [tokenId] }) as const),
  })
  const open = tokenIds
    .map((tokenId, index) => ({ tokenId, position: details[index] }))
    .filter(({ position }) => position[7] > 0n)
  if (!open.length) return []

  const tokenAddresses = [...new Set(open.flatMap(({ position }) => [position[2], position[3]]))]
  const [symbols, decimals, pools] = await Promise.all([
    readContracts(config, {
      allowFailure: false,
      contracts: tokenAddresses.map(address => ({ chainId, address, abi: erc20Abi, functionName: 'symbol' }) as const),
    }),
    readContracts(config, {
      allowFailure: false,
      contracts: tokenAddresses.map(
        address => ({ chainId, address, abi: erc20Abi, functionName: 'decimals' }) as const,
      ),
    }),
    readContracts(config, {
      allowFailure: false,
      contracts: open.map(
        ({ position: [, , token0, token1, fee] }) =>
          ({
            chainId,
            address: factory,
            abi: factoryAbi,
            functionName: 'getPool',
            args: [token0, token1, fee],
          }) as const,
      ),
    }),
  ])
  const tokens = fromEntries(
    tokenAddresses.map((address, i) => [address, { address, symbol: symbols[i], decimals: decimals[i] }] as const),
  )
  const [slots, poolLiquidities, withdrawals] = await Promise.all([
    readContracts(config, {
      allowFailure: false,
      contracts: pools.map(address => ({ chainId, address, abi: poolAbi, functionName: 'slot0' }) as const),
    }),
    readContracts(config, {
      allowFailure: false,
      contracts: pools.map(address => ({ chainId, address, abi: poolAbi, functionName: 'liquidity' }) as const),
    }),
    Promise.all(
      open.map(({ tokenId, position }) =>
        simulateWithdrawal(config, { chainId, owner, positionManager, tokenId, liquidity: position[7] }),
      ),
    ),
  ])

  return open.map(({ tokenId, position }, i): UniswapPosition => {
    const pair: UniswapPosition['tokens'] = [tokens[position[2]], tokens[position[3]]]
    const { principal, fees } = withdrawals[i]
    return {
      id: `${tokenId}`,
      tokenId: `${tokenId}`,
      positionManager,
      pool: pools[i],
      tokens: pair,
      fee: position[4],
      tickLower: position[5],
      tickUpper: position[6],
      tick: slots[i][1],
      liquidity: `${position[7]}`,
      poolLiquidity: `${poolLiquidities[i]}`,
      lpFeeShare: getLpFeeShare(slots[i][5]),
      amounts: [fromWei(principal[0], pair[0].decimals), fromWei(principal[1], pair[1].decimals)],
      fees: [fromWei(fees[0], pair[0].decimals), fromWei(fees[1], pair[1].decimals)],
    }
  })
}

/** The Enso router needs the NFT approved, either for this token or for all of the owner's positions. */
export async function fetchIsPositionApproved(
  config: Config,
  {
    chainId,
    owner,
    positionManager,
    tokenId,
    spender,
  }: { chainId: number; owner: Address; positionManager: Address; tokenId: string; spender: Address },
) {
  const npm = { chainId, address: positionManager, abi: positionManagerAbi } as const
  const [approved, approvedForAll] = await readContracts(config, {
    allowFailure: false,
    contracts: [
      { ...npm, functionName: 'getApproved', args: [BigInt(tokenId)] },
      { ...npm, functionName: 'isApprovedForAll', args: [owner, spender] },
    ],
  })
  return approvedForAll || isAddressEqual(approved, spender)
}
