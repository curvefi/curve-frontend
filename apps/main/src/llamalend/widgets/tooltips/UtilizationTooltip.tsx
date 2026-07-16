import { TooltipWrapper, TooltipDescription } from '@/llamalend/widgets/tooltips/TooltipComponents'
import { t } from '@ui-kit/lib/i18n'
import { MarketType } from '@ui-kit/types/market'

const descriptions: Record<MarketType, string[]> = {
  [MarketType.Lend]: [
    t`The percentage of total supplied debt tokens that are currently borrowed.`,
    t`High utilization can increase borrow rates and limit new borrowing or withdrawals.`,
  ],
  [MarketType.Mint]: [
    t`The percentage of the market's borrow cap that has been used.`,
    t`High utilization means less crvUSD can be borrowed until capacity is expanded or repaid.`,
  ],
}

export const UtilizationTooltip = ({ marketType }: { marketType: MarketType }) => (
  <TooltipWrapper>
    {descriptions[marketType].map((description, index) => (
      // eslint-disable-next-line @eslint-react/no-array-index-key -- Existing violation before enabling this rule.
      <TooltipDescription key={`${marketType}-${index}`} text={description} />
    ))}
  </TooltipWrapper>
)
