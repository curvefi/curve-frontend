import { useNetBorrowApr } from '@/llamalend/features/borrow/hooks/useNetBorrowApr'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useMarketFutureRates, useMarketRates } from '@/llamalend/queries/market'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Decimal } from '@primitives/decimal.utils'
import type { UserMarketParams } from '@ui-kit/lib/model'
import { q } from '@ui-kit/types/util'

/**
 * Shared hook for the borrow rate fields passed to LoanActionInfoList.
 * Encapsulates the identical logic across RemoveCollateral, AddCollateral, Repay, and BorrowMore.
 *
 * When `futureDebt` is provided (debt-changing operations like Repay and BorrowMore), also queries future rates.
 * When absent (collateral-only operations like Add/Remove), `rates` and `netBorrowApr` equal their "prev" counterparts.
 */
export function useBorrowRates<ChainId extends IChainId>(
  {
    params,
    futureDebt,
    market,
  }: {
    params: UserMarketParams<ChainId>
    market: LlamaMarketTemplate | undefined
    futureDebt?: Decimal
  },
  enabled: boolean,
) {
  const marketRates = q(useMarketRates(params, enabled))
  const futureRates = q(
    useMarketFutureRates(
      { chainId: params.chainId, marketId: params.marketId, debt: futureDebt },
      enabled && !!futureDebt,
    ),
  )
  const marketFutureRates = futureDebt && futureRates
  const { netBorrowApr, futureBorrowApr } = useNetBorrowApr({ market, params, marketRates, marketFutureRates }, enabled)

  return {
    prevRates: marketRates,
    rates: marketFutureRates ?? marketRates,
    prevNetBorrowApr: netBorrowApr && q(netBorrowApr),
    netBorrowApr: (futureBorrowApr ?? netBorrowApr) && q((futureBorrowApr ?? netBorrowApr)!),
  }
}
