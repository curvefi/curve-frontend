import { useConnection } from 'wagmi'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { CloseLoanMutation } from '@/llamalend/mutations/close-position.mutation'
import { useCloseEstimateGas } from '@/llamalend/queries/close-loan/close-loan-gas-estimate.query'
import { useCloseLoanIsApproved } from '@/llamalend/queries/close-loan/close-loan-is-approved.query'
import { useUserState } from '@/llamalend/queries/user'
import { LoanActionInfoList } from '@/llamalend/widgets/action-card/LoanActionInfoList'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { mapQuery, q } from '@ui-kit/types/util'
import { Decimal } from '@ui-kit/utils'

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
  const { borrowToken } = market ? getTokens(market) : {}
  const marketId = market?.id
  const userState = useUserState({ chainId, marketId, userAddress })

  return (
    <LoanActionInfoList
      slippage={slippage}
      onSlippageChange={onSlippageChange}
      gas={useCloseEstimateGas(networks, { chainId, marketId, userAddress, slippage })}
      debt={mapQuery(userState, () => ({ value: '0', tokenSymbol: borrowToken?.symbol }))}
      userState={userState}
      isApproved={q(
        useCloseLoanIsApproved({
          chainId,
          marketId,
          userAddress,
        }),
      )}
    />
  )
}
