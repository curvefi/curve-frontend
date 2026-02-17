import { useConnection } from 'wagmi'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { CloseLoanMutation } from '@/llamalend/mutations/close-position.mutation'
import { useCloseEstimateGas } from '@/llamalend/queries/close-loan/close-loan-gas-estimate.query'
import { useCloseLoanIsApproved } from '@/llamalend/queries/close-loan/close-loan-is-approved.query'
import { useUserState } from '@/llamalend/queries/user-state.query'
import { LoanInfoAccordion } from '@/llamalend/widgets/action-card/LoanInfoAccordion'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { mapQuery, q } from '@ui-kit/types/util'
import { Decimal } from '@ui-kit/utils'

type ClosePositionInfoAccordionProps = {
  market: LlamaMarketTemplate | undefined
  chainId: LlamaChainId
  networks: NetworkDict<LlamaChainId>
  values: CloseLoanMutation
  onSlippageChange: (newSlippage: Decimal) => void
}

export function ClosePositionInfoAccordion({
  chainId,
  market,
  networks,
  values: { slippage },
  onSlippageChange,
}: ClosePositionInfoAccordionProps) {
  const { address: userAddress } = useConnection()
  const [isOpen, , , toggle] = useSwitch(false)
  const { borrowToken } = market ? getTokens(market) : {}
  const marketId = market?.id
  const userState = q(useUserState({ chainId, marketId, userAddress }, isOpen))

  return (
    <LoanInfoAccordion
      isOpen={isOpen}
      toggle={toggle}
      slippage={slippage}
      onSlippageChange={onSlippageChange}
      gas={useCloseEstimateGas(networks, { chainId, marketId, userAddress, slippage }, isOpen)}
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
