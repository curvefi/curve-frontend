import { t } from '@ui-kit/lib/i18n'
import { TooltipWrapper, TooltipDescription } from '@ui-kit/shared/ui/TooltipComponents'
import type { MarketType } from '@ui-kit/types/market'

const descriptions: Record<MarketType, string[]> = {
  lend: [
    t`The percentage of total supplied debt tokens that are currently borrowed.`,
    t`High utilization can increase borrow rates and limit new borrowing or withdrawals.`,
  ],
  mint: [
    t`The percentage of the market's borrow cap that has been used.`,
    t`High utilization means less crvUSD can be borrowed until capacity is expanded or repaid.`,
  ],
}

export const UtilizationTooltip = ({ marketType }: { marketType: MarketType }) => (
  <TooltipWrapper>
    {descriptions[marketType].map((description, index) => (
      <TooltipDescription key={`${marketType}-${index}`} text={description} />
    ))}
  </TooltipWrapper>
)
