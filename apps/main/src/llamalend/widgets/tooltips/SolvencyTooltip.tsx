import { TooltipWrapper, TooltipDescription } from '@/llamalend/widgets/tooltips/TooltipComponents'
import { t } from '@ui-kit/lib/i18n'
import { LlamaMarketType } from '@ui-kit/types/market'

type SolvencyTooltipType = LlamaMarketType | 'overview'

const descriptions: Record<SolvencyTooltipType, string[]> = {
  [LlamaMarketType.Lend]: [
    t`Solvency shows the share of total supplied liquidity that remains covered after accounting for bad debt.`,
    t`A lower solvency means a larger portion of suppliers' funds is no longer fully backed by healthy positions.`,
  ],
  [LlamaMarketType.Mint]: [
    t`Mint markets issue crvUSD directly through the protocol against deposited collateral.`,
    t`Because this debt is protocol-issued rather than borrowed from supplied liquidity, mint markets are always solvent.`,
  ],
  overview: [
    t`For lending markets, solvency shows the share of total supplied liquidity that remains covered after accounting for bad debt.`,
    t`For mint markets, crvUSD debt is issued directly by the protocol rather than borrowed from supplied liquidity.`,
  ],
}

export const SolvencyTooltip = ({ type }: { type: SolvencyTooltipType }) => (
  <TooltipWrapper>
    {descriptions[type].map(description => (
      <TooltipDescription key={type} text={description} />
    ))}
  </TooltipWrapper>
)
