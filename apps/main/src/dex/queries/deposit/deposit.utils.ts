import type { DepositQuery } from '@/dex/features/deposit/types'
import { getPoolAmounts } from '@ui/features/pool-forms/pool-form.utils'

/** Curve's API requires a dense vector; unentered fields represent zero deposits in pool token order. */
export const getDepositAmounts = (params: DepositQuery) =>
  getPoolAmounts(params, params.decimals?.length)!.map(amount => amount ?? '0')
