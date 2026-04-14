import { TooltipWrapper, TooltipDescription } from '@/llamalend/widgets/tooltips/TooltipComponents'
import { t } from '@ui-kit/lib/i18n'
import { LlamaMarketType } from '@ui-kit/types/market'

const descriptions: Record<LlamaMarketType, string[]> = {
  [LlamaMarketType.Lend]: [
    t`Solvency shows the share of total supplied liquidity that remains covered after accounting for bad debt.`,
    t`A lower solvency means a larger portion of suppliers' funds is no longer fully backed by healthy positions.`,
  ],
  [LlamaMarketType.Mint]: [
    t`Solvency shows the share of outstanding debt that remains covered after accounting for bad debt.`,
    t`A lower solvency means a larger portion of the market's debt is no longer fully backed by healthy positions.`,
  ],
}

export const SolvencyTooltip = ({ marketType }: { marketType: LlamaMarketType }) => (
  <TooltipWrapper>
    {descriptions[marketType].map((description, index) => (
      <TooltipDescription key={`${marketType}-${index}`} text={description} />
    ))}
  </TooltipWrapper>
)
