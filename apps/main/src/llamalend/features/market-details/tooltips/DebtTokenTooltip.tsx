import { TooltipWrapper, TooltipDescription } from '@/llamalend/widgets/tooltips/TooltipComponents'
import { t } from '@ui-kit/lib/i18n'
import { LlamaMarketType } from '@ui-kit/types/market'

const descriptions: Record<LlamaMarketType, string[]> = {
  [LlamaMarketType.Lend]: [
    t`The asset that can be supplied by lenders and borrowed by users in this market.`,
    t`Lenders earn yield (shown as Supply Rate), and borrowers pay interest on borrowed amounts.`,
    t`This token is subject to utilization dynamics — higher usage typically increases borrow rates.`,
  ],
  [LlamaMarketType.Mint]: [
    t`The asset that is minted (borrowed) when you deposit collateral.`,
    t`In most minting markets, this is crvUSD, issued directly by the protocol.`,
    t`You incur interest on the minted amount, and must repay it to unlock your collateral.`,
  ],
}

export const DebtTokenTooltip = ({ marketType }: { marketType: LlamaMarketType }) => (
  <TooltipWrapper>
    {descriptions[marketType].map((description, index) => (
      <TooltipDescription key={`${marketType}-${index}`} text={description} />
    ))}
  </TooltipWrapper>
)
