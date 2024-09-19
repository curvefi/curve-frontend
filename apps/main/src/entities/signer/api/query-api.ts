import type { QueryFunction } from '@tanstack/react-query'
import type { SignerPoolBalancesMapperResp, SignerPoolDetailsResp, SignerQueryKeyType } from '@/entities/signer'

import { isValidAddress } from '@/utils'
import { getUserPoolActiveKey } from '@/store/createUserSlice'
import useStore from '@/store/useStore'

export const querySignerPoolBalances: QueryFunction<
  SignerPoolBalancesMapperResp,
  SignerQueryKeyType<'signerPoolBalances'>
> = async ({ queryKey }) => {
  const [, , chainId, signerAddress, poolId] = queryKey

  let resp: SignerPoolBalancesMapperResp = {}

  if (!chainId || !signerAddress || !poolId) return resp

  const { curve } = useStore.getState()
  const pool = curve.getPool(poolId)

  const [wrappedCoinBalances, underlyingBalances, lpTokenBalances] = await Promise.all([
    pool.wallet.wrappedCoinBalances(),
    pool.wallet.underlyingCoinBalances(),
    pool.wallet.lpTokenBalances(),
  ])

  return Object.entries({
    ...wrappedCoinBalances,
    ...underlyingBalances,
    ...lpTokenBalances,
  }).reduce((prev, [address, balance]) => {
    prev[address] = balance as string
    return prev
  }, {} as SignerPoolBalancesMapperResp)
}

export const querySignerPoolDetails: QueryFunction<
  SignerPoolDetailsResp,
  SignerQueryKeyType<'signerPoolDetails'>
> = async ({ queryKey }) => {
  const [, , chainId, signerAddress, poolId] = queryKey

  let resp: SignerPoolDetailsResp = {
    liquidityUsd: '',
    crvApy: null,
    boostApy: '',
    userShare: null,
    lpTokenBalances: {},
  }

  if (!poolId) return resp

  const { curve, user } = useStore.getState()
  const pool = curve.getPool(poolId)
  const userPoolActiveKey = getUserPoolActiveKey(curve, poolId)

  // get user pool info
  const isValidGaugeAddress = isValidAddress(pool.gauge.address)
  // const isRewardsOnly = pool.rewardsOnly()

  const [liquidityUsd, userShare, lpTokenBalances, crvApy, boostApy] = await Promise.all([
    pool.userLiquidityUSD(signerAddress),
    pool.userShare(signerAddress), // TODO need to check why gauge and lp return same value.
    pool.wallet.lpTokenBalances(),
    pool.userCrvApy(signerAddress),
    chainId === 1 && isValidGaugeAddress ? pool.userBoost(signerAddress) : '',
  ])

  resp.liquidityUsd = liquidityUsd
  resp.userShare = userShare
  resp.lpTokenBalances = lpTokenBalances as { [key: string]: string }
  resp.crvApy = Number.isNaN(crvApy) ? 0 : crvApy // handle NaN
  resp.boostApy = boostApy === 'NaN' ? '0' : boostApy // handle 'NaN'

  user.setStateByActiveKey('userCrvApy', userPoolActiveKey, { crvApy, boostApy })
  user.setStateByActiveKey('userShare', userPoolActiveKey, userShare)
  user.setStateByActiveKey('userLiquidityUsd', userPoolActiveKey, liquidityUsd)

  return resp
}
