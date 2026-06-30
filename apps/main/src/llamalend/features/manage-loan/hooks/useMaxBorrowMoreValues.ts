import { PRESET_RANGES } from '@/llamalend/constants'
import type { UserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { isPositionLeveraged } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { resetBorrowMoreExpectedCollateral } from '@/llamalend/queries/borrow-more/borrow-more-expected-collateral.query'
import { useBorrowMoreMaxReceive } from '@/llamalend/queries/borrow-more/borrow-more-max-receive.query'
import { useMarketMaxLeverage } from '@/llamalend/queries/market'
import { BorrowMoreForm, BorrowMoreParams } from '@/llamalend/queries/validation/borrow-more.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Address } from '@primitives/address.utils'
import { useFormSync, useOnChangeCallback } from '@ui-kit/features/forms'
import type { UseFormReturn } from '@ui-kit/features/forms'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { mapQuery, type QueryProp } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'

export function useMaxBorrowMoreValues<ChainId extends LlamaChainId>({
  params,
  form,
  market,
  borrowTokenAddress,
  collateralTokenAddress,
  collateralEvents: { data: events },
}: {
  params: BorrowMoreParams<ChainId>
  form: UseFormReturn<BorrowMoreForm>
  market: LlamaMarketTemplate | undefined
  borrowTokenAddress: Address | undefined
  collateralTokenAddress: Address | undefined
  collateralEvents: QueryProp<UserCollateralEvents>
}) {
  const { chainId, userAddress, marketId } = params

  const maxUserCollateral = useTokenBalance({
    chainId,
    userAddress,
    tokenAddress: collateralTokenAddress,
  })
  const maxUserBorrowed = useTokenBalance({
    chainId,
    userAddress,
    tokenAddress: borrowTokenAddress,
  })

  const maxReceive = useBorrowMoreMaxReceive(params)
  const maxLeverage = useMarketMaxLeverage({ chainId, marketId, range: PRESET_RANGES.MaxLtv })

  useFormSync(form, { maxCollateral: maxUserCollateral.data })
  useFormSync(form, { maxBorrowed: maxUserBorrowed.data })
  useFormSync(form, { maxDebt: maxReceive.data?.maxDebt })
  // the leverage checkbox only shows after this value is known, purposefully override the value if the backend changes
  useFormSync(form, { leverageEnabled: events && isPositionLeveraged(events.originalLeverage) })

  // some borrow queries depend on LL internal cache for expected collateral, reset when new market data arrives
  useOnChangeCallback(market, () => resetBorrowMoreExpectedCollateral(params))

  return {
    userCollateral: { ...maxUserCollateral, field: 'maxCollateral' as const },
    userBorrowed: { ...maxUserBorrowed, field: 'maxBorrowed' as const },
    debt: { ...mapQuery(maxReceive, d => decimal(d.maxDebt)), field: 'maxDebt' as const },
    maxLeverage,
  }
}
