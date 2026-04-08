import { useEffect } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { PRESET_RANGES } from '@/llamalend/constants'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useBorrowMoreMaxReceive } from '@/llamalend/queries/borrow-more/borrow-more-max-receive.query'
import { useMarketMaxLeverage } from '@/llamalend/queries/market'
import { useIsLeveragedPosition } from '@/llamalend/queries/user/user-current-leverage.query'
import { BorrowMoreForm, BorrowMoreParams } from '@/llamalend/queries/validation/borrow-more.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { mapQuery } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'
import { updateForm, useFormSync } from '@ui-kit/utils/react-form.utils'

export function useMaxBorrowMoreValues<ChainId extends LlamaChainId>(
  {
    params,
    form,
    market,
  }: {
    params: BorrowMoreParams<ChainId>
    form: UseFormReturn<BorrowMoreForm>
    market: LlamaMarketTemplate | undefined
  },
  enabled?: boolean,
) {
  const { chainId, userAddress, marketId } = params
  const { borrowToken, collateralToken } = market ? getTokens(market) : {}
  const isLeverage = useIsLeveragedPosition(params)

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
  useEffect(() => updateForm(form, { leverageEnabled: isLeverage.data ?? undefined }), [form, isLeverage.data])

  return {
    userCollateral: { ...maxUserCollateral, field: 'maxCollateral' as const },
    userBorrowed: { ...maxUserBorrowed, field: 'maxBorrowed' as const },
    debt: { ...mapQuery(maxReceive, (d) => decimal(d.maxDebt)), field: 'maxDebt' as const },
    maxLeverage,
  }
}
