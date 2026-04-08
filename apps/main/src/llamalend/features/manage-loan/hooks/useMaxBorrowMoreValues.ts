import type { UseFormReturn } from 'react-hook-form'
import { PRESET_RANGES } from '@/llamalend/constants'
import type { UserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { getTokens, isPositionLeveraged } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useBorrowMoreMaxReceive } from '@/llamalend/queries/borrow-more/borrow-more-max-receive.query'
import { useMarketMaxLeverage } from '@/llamalend/queries/market'
import { BorrowMoreForm, BorrowMoreParams } from '@/llamalend/queries/validation/borrow-more.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { mapQuery, type QueryProp } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'
import { useFormSync } from '@ui-kit/utils/react-form.utils'

export function useMaxBorrowMoreValues<ChainId extends LlamaChainId>(
  {
    params,
    form,
    market,
    collateralEvents: { data: events },
  }: {
    params: BorrowMoreParams<ChainId>
    form: UseFormReturn<BorrowMoreForm>
    market: LlamaMarketTemplate | undefined
    collateralEvents: QueryProp<UserCollateralEvents>
  },
  enabled?: boolean,
) {
  const { chainId, userAddress, marketId } = params
  const { borrowToken, collateralToken } = market ? getTokens(market) : {}

  const maxUserCollateral = useTokenBalance({
    chainId,
    userAddress,
    tokenAddress: collateralToken?.address,
  })
  const maxUserBorrowed = useTokenBalance({
    chainId,
    userAddress,
    tokenAddress: borrowToken?.address,
  })

  const maxReceive = useBorrowMoreMaxReceive(params, enabled)
  const maxLeverage = useMarketMaxLeverage({ chainId, marketId, range: PRESET_RANGES.MaxLtv }, enabled)

  useFormSync(form, { maxCollateral: maxUserCollateral.data })
  useFormSync(form, { maxBorrowed: maxUserBorrowed.data })
  useFormSync(form, { maxDebt: maxReceive.data?.maxDebt })
  useFormSync(form, { leverageEnabled: events && isPositionLeveraged(events.originalLeverage) })

  return {
    userCollateral: { ...maxUserCollateral, field: 'maxCollateral' as const },
    userBorrowed: { ...maxUserBorrowed, field: 'maxBorrowed' as const },
    debt: { ...mapQuery(maxReceive, (d) => decimal(d.maxDebt)), field: 'maxDebt' as const },
    maxLeverage,
  }
}
