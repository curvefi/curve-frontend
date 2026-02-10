import { useConnection } from 'wagmi'
import { useLoanToValueFromUserState } from '@/llamalend/features/manage-loan/hooks/useLoanToValueFromUserState'
import { useHealthQueries } from '@/llamalend/hooks/useHealthQueries'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { CloseLoanMutation } from '@/llamalend/mutations/close-position.mutation'
import { useCloseEstimateGas } from '@/llamalend/queries/close-loan/close-loan-gas-estimate.query'
import { useCloseLoanIsApproved } from '@/llamalend/queries/close-loan/close-loan-is-approved.query'
import { useMarketRates } from '@/llamalend/queries/market-rates.query'
import { getUserHealthOptions } from '@/llamalend/queries/user-health.query'
import { useUserState } from '@/llamalend/queries/user-state.query'
import { LoanInfoAccordion } from '@/llamalend/widgets/action-card/LoanInfoAccordion'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { mapQuery, q } from '@ui-kit/types/util'
import { Decimal } from '@ui-kit/utils'

type ClosePositionInfoAccordionProps = {
  market: LlamaMarketTemplate | undefined
  enabled: boolean | undefined
  chainId: LlamaChainId
  networks: NetworkDict<LlamaChainId>
  values: CloseLoanMutation
  onSlippageChange: (newSlippage: Decimal) => void
}

export function ClosePositionInfoAccordion({
  enabled = true,
  chainId,
  market,
  networks,
  values: { slippage },
  onSlippageChange,
}: ClosePositionInfoAccordionProps) {
  const { address: userAddress } = useConnection()
  const [isOpen, , , toggle] = useSwitch(false)
  const { collateralToken, borrowToken } = market ? getTokens(market) : {}
  enabled &&= isOpen
  const marketId = market?.id
  const userState = q(useUserState({ chainId, userAddress, marketId }, enabled))
  return (
    <LoanInfoAccordion
      isOpen={enabled}
      toggle={toggle}
      onSlippageChange={onSlippageChange}
      prevHealth={useHealthQueries((isFull) => getUserHealthOptions({ marketId, chainId, userAddress, isFull }))}
      isFullRepay
      rates={q(useMarketRates({ chainId, marketId }, enabled))}
      loanToValue={useLoanToValueFromUserState(
        {
          chainId,
          marketId,
          userAddress,
          collateralToken,
          borrowToken,
          expectedBorrowed: '0',
        },
        enabled,
      )}
      gas={useCloseEstimateGas(networks, { chainId, marketId, userAddress, slippage }, isOpen)}
      debt={mapQuery(userState, ({ debt }) => ({ value: debt, tokenSymbol: borrowToken?.symbol }))}
      collateral={mapQuery(userState, ({ collateral }) => ({
        value: collateral,
        tokenSymbol: collateralToken?.symbol,
      }))}
      userState={userState}
      collateralSymbol={collateralToken?.symbol}
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
