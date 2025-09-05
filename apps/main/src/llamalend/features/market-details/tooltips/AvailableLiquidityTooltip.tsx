import { t } from '@ui-kit/lib/i18n'
import { TooltipWrapper, TooltipDescription } from '@/llamalend/widgets/tooltips/TooltipComponents'
import { LlamaMarketType } from '@ui-kit/types/market'

const descriptions: Record<LlamaMarketType, string[]> = {
  [LlamaMarketType.Lend]: [
    t`The amount of the debt token (e.g., crvUSD) currently available to be borrowed or withdrawn by users.`,
    t`It reflects the unused supply in the lending pool.`,
  ],
  [LlamaMarketType.Mint]: [
    t`The remaining crvUSD borrowing capacity in this market, based on protocol-defined borrow caps.`,
    t`Although crvUSD is minted on demand, borrowing is limited to ensure system stability.`,
  ],
}

export const AvailableLiquidityTooltip = ({ marketType }: { marketType: LlamaMarketType }) => (
  <TooltipWrapper>
    {descriptions[marketType].map((description, index) => (
      <TooltipDescription key={`${marketType}-${index}`} text={description} />
    ))}
  </TooltipWrapper>
)
