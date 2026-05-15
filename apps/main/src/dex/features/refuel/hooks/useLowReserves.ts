import type { Address } from 'viem'
import { useReadContract } from 'wagmi'
import type { Chain } from '@curvefi/prices-api'
import { combineQueryState } from '@ui-kit/lib'
import { refuelPoolAbi } from '../abi'
import { useRefuelPool } from '../queries/pools.query'

const LOW_RESERVES_RATIO = 1 / 10000

/**
 * After consultation with Michael K, it was determined that the reserve ratio should be the ratio of
 * available refuel shares to the total supply of LP tokens (as they're both represented in the same units)
 **/
export const useLowReserves = ({
  chainId,
  blockchainId,
  poolAddress,
}: {
  chainId: number
  blockchainId: Chain
  poolAddress: Address
}) => {
  const pool = useRefuelPool({ blockchainId, poolAddress })
  const refuelShares = useReadContract({
    address: poolAddress,
    abi: refuelPoolAbi,
    functionName: 'donation_shares',
    chainId,
  })

  const reserveRatio =
    refuelShares.data == null || pool.data == null || pool.data.lpTokenSupply === 0
      ? undefined
      : Number(refuelShares.data) / 10 ** 18 / pool.data.lpTokenSupply

  return {
    data:
      reserveRatio == null
        ? undefined
        : {
            reserveRatio,
            lowReserves: reserveRatio < LOW_RESERVES_RATIO,
          },
    ...combineQueryState(pool, refuelShares),
  }
}
