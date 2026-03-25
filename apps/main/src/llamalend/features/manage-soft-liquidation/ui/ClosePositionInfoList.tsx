import { useConnection } from 'wagmi'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { CloseLoanMutation } from '@/llamalend/mutations/close-position.mutation'
import { useCloseEstimateGas } from '@/llamalend/queries/close-loan/close-loan-gas-estimate.query'
import { useCloseLoanIsApproved } from '@/llamalend/queries/close-loan/close-loan-is-approved.query'
import { LoanActionInfoList } from '@/llamalend/widgets/action-card/LoanActionInfoList'
import { usePrevLoanState } from '@/llamalend/widgets/action-card/usePrevLoanState'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Decimal } from '@primitives/decimal.utils'
import { constQ, q } from '@ui-kit/types/util'

type ClosePositionInfoListProps = {
  market: LlamaMarketTemplate | undefined
  chainId: LlamaChainId
  networks: NetworkDict<LlamaChainId>
  values: CloseLoanMutation
  onSlippageChange: (newSlippage: Decimal) => void
}

export function ClosePositionInfoList({
  chainId,
  market,
  networks,
  values: { slippage },
  onSlippageChange,
}: ClosePositionInfoListProps) {
  const { address: userAddress } = useConnection()
  const { borrowToken, collateralToken } = market ? getTokens(market) : {}
  const marketId = market?.id
  const params = { chainId, marketId, userAddress, slippage }
  return (
    <LoanActionInfoList
      isOpen
      slippage={slippage}
      onSlippageChange={onSlippageChange}
      gas={q(useCloseEstimateGas(networks, params))}
      debt={constQ({ value: '0', tokenSymbol: borrowToken?.symbol })}
      collateral={constQ({ value: '0', tokenSymbol: collateralToken?.symbol })}
      isApproved={q(useCloseLoanIsApproved(params))}
      {...usePrevLoanState({
        params,
        collateralToken,
        borrowToken,
      })}
    />
  )
}
