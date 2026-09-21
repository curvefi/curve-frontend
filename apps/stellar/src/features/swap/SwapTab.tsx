import type { PoolQuery } from '@/stellar/queries/root-keys'
import { SwapForm } from '@ui/features/pool-forms/swap/SwapForm'
import { SwapActionInfoList } from './SwapActionInfoList'
import { useSwapForm } from './useSwapForm'

export const SwapTab = (params: PoolQuery) => {
  const { params: queryParams, ...form } = useSwapForm(params)
  return <SwapForm {...form} footer={<SwapActionInfoList {...queryParams} toSymbol={form.toSymbol} />} />
}
