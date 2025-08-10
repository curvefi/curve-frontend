import { t } from '@ui-kit/lib/i18n'
import { TooltipWrapper, TooltipDescription } from '@ui-kit/shared/ui/TooltipComponents'
import type { MarketType } from '@ui-kit/types/market'

const descriptions: Record<MarketType, string[]> = {
  lend: [
    t`The asset that can be supplied by lenders and borrowed by users in this market.`,
    t`Lenders earn yield (shown as Supply Rate), and borrowers pay interest on borrowed amounts.`,
    t`This token is subject to utilization dynamics — higher usage typically increases borrow rates.`,
  ],
  mint: [
    t`The asset that is minted (borrowed) when you deposit collateral.`,
    t`In most minting markets, this is crvUSD, issued directly by the protocol.`,
    t`You incur interest on the minted amount, and must repay it to unlock your collateral.`,
  ],
}

export const DebtTokenTooltip = ({ marketType }: { marketType: MarketType }) => (
  <TooltipWrapper>
    {descriptions[marketType].map((description, index) => (
      <TooltipDescription key={`${marketType}-${index}`} text={description} />
    ))}
  </TooltipWrapper>
)
