import { TooltipWrapper, TooltipDescription } from '@/llamalend/widgets/tooltips/TooltipComponents'
import { t } from '@ui-kit/lib/i18n'
import { MarketType } from '@ui-kit/types/market'

const descriptions: Record<MarketType, string[]> = {
  [MarketType.Lend]: [
    t`The amount of the debt token (e.g., crvUSD) currently available to be borrowed or withdrawn by users.`,
    t`It reflects the unused supply in the lending pool.`,
  ],
  [MarketType.Mint]: [
    t`The remaining crvUSD borrowing capacity in this market, based on protocol-defined borrow caps.`,
    t`Although crvUSD is minted on demand, borrowing is limited to ensure system stability.`,
  ],
}

export const AvailableLiquidityTooltip = ({ marketType }: { marketType: MarketType }) => (
  <TooltipWrapper>
    {descriptions[marketType].map((description, index) => (
      // eslint-disable-next-line @eslint-react/no-array-index-key -- Existing violation before enabling this rule.
      <TooltipDescription key={`${marketType}-${index}`} text={description} />
    ))}
  </TooltipWrapper>
)
