import { t } from '@ui-kit/lib/i18n'
import { TooltipWrapper, TooltipDescription } from '@ui-kit/shared/ui/TooltipComponents'
import { MarketType } from '@ui-kit/types/market'

type SolvencyTooltipType = MarketType | 'overview'

const descriptions: Record<SolvencyTooltipType, string[]> = {
  [MarketType.Lend]: [
    t`Solvency shows the share of total supplied liquidity that remains covered after accounting for bad debt.`,
    t`A lower solvency means a larger portion of suppliers' funds is no longer fully backed by healthy positions.`,
  ],
  [MarketType.Mint]: [
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
    {descriptions[type].map((description, index) => (
      // eslint-disable-next-line @eslint-react/no-array-index-key -- Existing violation before enabling this rule.
      <TooltipDescription key={`${type}-${index}`} text={description} />
    ))}
  </TooltipWrapper>
)
