import { useConnection } from 'wagmi'
import type { MarketTokensOrEmpty } from '@/llamalend/llama.utils'
import type { CloseLoanMutation } from '@/llamalend/mutations/close-position.mutation'
import { useCloseEstimateGas } from '@/llamalend/queries/close-loan/close-loan-gas-estimate.query'
import { useCloseLoanIsApproved } from '@/llamalend/queries/close-loan/close-loan-is-approved.query'
import { useMarketOraclePrice } from '@/llamalend/queries/market'
import { usePrevLoanState } from '@/llamalend/widgets/action-card/hooks/usePrevLoanState'
import { LoanActionInfoList } from '@/llamalend/widgets/action-card/LoanActionInfoList'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { constQ, q } from '@evm-ui/types/util'

type ClosePositionInfoListProps = {
  marketId: string | undefined
  tokens: MarketTokensOrEmpty
  chainId: LlamaChainId
  values: CloseLoanMutation
}

export function ClosePositionInfoList({
  chainId,
  marketId,
  tokens: { borrowToken, collateralToken },
  values: { slippage },
}: ClosePositionInfoListProps) {
  const params = { chainId, marketId, userAddress: useConnection().address, slippage }
  return (
    <LoanActionInfoList
      isOpen
      gas={q(useCloseEstimateGas(params))}
      debt={constQ('0')}
      collateral={constQ('0')}
      isApproved={q(useCloseLoanIsApproved(params))}
      oraclePrice={q(useMarketOraclePrice(params))}
      {...usePrevLoanState({ params, collateralToken, borrowToken })}
    />
  )
}
