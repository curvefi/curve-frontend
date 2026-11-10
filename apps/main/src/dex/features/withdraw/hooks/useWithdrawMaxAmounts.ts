import { getWithdrawMaxAmountQueryOptions } from '@/dex/queries/withdraw/withdraw-max-amounts.query'
import { range } from '@primitives/objects.utils'
import { useQueries } from '@ui/features/queries/query-hooks'
import { q } from '@ui/features/queries/util'
import type { WithdrawLpParams } from '../types'

export const useWithdrawMaxAmounts = ({
  params,
  tokenCount,
  enabled,
}: {
  params: WithdrawLpParams
  tokenCount: number
  enabled: boolean
}) =>
  useQueries({
    queries: range(tokenCount).map(index => getWithdrawMaxAmountQueryOptions({ ...params, index }, enabled)),
    combine: results => results.map(q),
  })
