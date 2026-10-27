import { readContract } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { LP_TOKEN_DECIMALS } from '@/stellar/lib/amounts'
import { fetchPoolInfo } from '@/stellar/queries/pool/pool-info.query'
import type { PoolParams, PoolQuery } from '@/stellar/queries/query-types'
import { poolValidationSuite } from '@/stellar/queries/validation/pool.validation'
import { queryFactory } from '@ui/features/queries/factory'
import { decimal, decimalDiv, decimalPercent, fromWei } from '@ui/lib/decimal'

type PoolSnapshot = {
  active_balances: bigint[]
  admin_balances: bigint[]
  lp_supply: bigint
  current_scaled_amplification: bigint
  amplification_ramp: {
    initial_scaled_amplification: bigint
    target_scaled_amplification: bigint
    ramp_start_time: bigint
    ramp_end_time: bigint
  }
  fee: bigint
  admin_fee: bigint
  offpeg_fee_multiplier: bigint
  ma_exp_time: bigint
  d_ma_time: bigint
  price_time: bigint
  d_time: bigint
}

export const { useQuery: usePoolSnapshot, invalidate: invalidatePoolSnapshot } = queryFactory({
  queryKey: ({ network, pool }: PoolParams) => ({ name: 'pool_snapshot', network, pool, version: 2 }) as const,
  queryFn: async ({ network, pool }: PoolQuery) => {
    const [snapshot, { scales, coin_decimals }] = await Promise.all([
      readContract<PoolSnapshot>(network, pool, 'pool_snapshot'),
      fetchPoolInfo({ network, pool }),
    ])
    const { initial_scaled_amplification, target_scaled_amplification, ramp_start_time, ramp_end_time } =
      snapshot.amplification_ramp
    const amplificationScale = decimal(scales.amplification_scale)!
    const feeDenominator = decimal(scales.fee_denominator)!
    return {
      active_balances: snapshot.active_balances.map((balance, index) => fromWei(balance, coin_decimals[index])),
      lp_supply: fromWei(snapshot.lp_supply, LP_TOKEN_DECIMALS),
      A: decimalDiv(decimal(snapshot.current_scaled_amplification)!, amplificationScale),
      initial_A: decimalDiv(decimal(initial_scaled_amplification)!, amplificationScale),
      future_A: decimalDiv(decimal(target_scaled_amplification)!, amplificationScale),
      initial_A_time: Number(ramp_start_time) * 1000,
      future_A_time: Number(ramp_end_time) * 1000,
      isRampUp: target_scaled_amplification > initial_scaled_amplification,
      offpegFeeMultiplier: Number(snapshot.offpeg_fee_multiplier),
      ammFee: decimalPercent(decimal(snapshot.fee)!, feeDenominator),
      daoFee: decimalPercent(decimal(snapshot.admin_fee)!, feeDenominator),
    }
  },
  category: 'dex.pool',
  validationSuite: poolValidationSuite,
})
