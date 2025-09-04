import { t } from '@ui-kit/lib/i18n'
import { TooltipWrapper, TooltipDescription } from '@ui-kit/shared/ui/TooltipComponents'
import { LlamaMarketType } from '@ui-kit/types/market'

const descriptions: Record<LlamaMarketType, string[]> = {
  [LlamaMarketType.Lend]: [
    t`The percentage of total supplied debt tokens that are currently borrowed.`,
    t`High utilization can increase borrow rates and limit new borrowing or withdrawals.`,
  ],
  [LlamaMarketType.Mint]: [
    t`The percentage of the market's borrow cap that has been used.`,
    t`High utilization means less crvUSD can be borrowed until capacity is expanded or repaid.`,
  ],
}

export const UtilizationTooltip = ({ marketType }: { marketType: LlamaMarketType }) => (
  <TooltipWrapper>
    {descriptions[marketType].map((description, index) => (
      <TooltipDescription key={`${marketType}-${index}`} text={description} />
    ))}
  </TooltipWrapper>
)
