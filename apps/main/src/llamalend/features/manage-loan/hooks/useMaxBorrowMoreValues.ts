import { PRESET_RANGES } from '@/llamalend/constants'
import {
  type BorrowMoreMaxReceiveParams,
  useBorrowMoreMaxReceiveQueries,
} from '@/llamalend/queries/borrow-more/borrow-more-max-receive.query'
import { useMarketMaxLeverage } from '@/llamalend/queries/market/market-max-leverage.query'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useTokenBalance } from '@evm-ui/hooks/useTokenBalance'
import type { Address } from '@primitives/address.utils'
import { mapQuery, q } from '@ui/features/queries/util'

export function useMaxBorrowMoreValues<ChainId extends LlamaChainId>({
  params,
  borrowTokenAddress,
  collateralTokenAddress,
}: {
  params: BorrowMoreMaxReceiveParams<ChainId>
  borrowTokenAddress: Address | undefined
  collateralTokenAddress: Address | undefined
}) {
  const { chainId, userAddress, marketId } = params

  const maxUserCollateral = useTokenBalance({ chainId, userAddress, tokenAddress: collateralTokenAddress })
  const maxUserBorrowed = useTokenBalance({ chainId, userAddress, tokenAddress: borrowTokenAddress })

  const maxReceive = useBorrowMoreMaxReceiveQueries(params)
  const maxLeverage = useMarketMaxLeverage({ chainId, marketId, range: PRESET_RANGES.MaxLtv })

  return {
    userCollateral: { ...q(maxUserCollateral), fieldName: 'maxCollateral' as const },
    userBorrowed: { ...q(maxUserBorrowed), fieldName: 'maxBorrowed' as const },
    debt: { ...mapQuery(maxReceive, ({ maxDebt, router }) => ({ maxDebt, router })), fieldName: 'maxDebt' as const },
    maxLeverage,
  }
}
