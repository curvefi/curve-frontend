import { useConnection } from 'wagmi'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { CloseLoanMutation } from '@/llamalend/mutations/close-position.mutation'
import { useCloseEstimateGas } from '@/llamalend/queries/close-loan/close-loan-gas-estimate.query'
import { useCloseLoanIsApproved } from '@/llamalend/queries/close-loan/close-loan-is-approved.query'
import { useUserState } from '@/llamalend/queries/user-state.query'
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

const ALWAYS_OPEN = true

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
  const userState = q(useUserState({ chainId, marketId, userAddress }, ALWAYS_OPEN))

  return (
    <LoanActionInfoList
      isOpen={ALWAYS_OPEN}
      slippage={slippage}
      onSlippageChange={onSlippageChange}
      gas={useCloseEstimateGas(networks, { chainId, marketId, userAddress, slippage }, ALWAYS_OPEN)}
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
