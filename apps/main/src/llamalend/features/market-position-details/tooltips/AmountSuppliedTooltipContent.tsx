import type { Shares } from '@/llamalend/queries/user/user-balances.query'
import { UnavailableNotation } from '@/llamalend/widgets/tooltips/tooltip.utils'
import {
  TooltipDescription,
  TooltipItem,
  TooltipItems,
  TooltipWrapper,
} from '@/llamalend/widgets/tooltips/TooltipComponents'
import type { Decimal } from '@primitives/decimal.utils'
import { maybes, maybe } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import type { QueryProp } from '@ui-kit/types/util'
import { decimalDiv, decimalMinus, decimalMultiply, formatNumber } from '@ui-kit/utils'
import type { SupplyAsset } from '../SupplyPositionDetails'

const formatAmount = (
  percentage: Decimal | null | undefined,
  depositedAmount: Decimal | null | undefined,
  symbol: string | null | undefined,
) =>
  maybes(
    [percentage, depositedAmount, symbol],
    ([percentage, depositedAmount, symbol]) =>
      `${formatNumber(decimalMultiply(percentage, depositedAmount), { abbreviate: true })} ${symbol}`,
  )

const formatPercentageDisplay = (percentage: Decimal | null | undefined) =>
  maybe(percentage, p => formatNumber(decimalMultiply(p, '100'), 'percent.rate')) ?? UnavailableNotation

export const AmountSuppliedTooltipContent = ({
  shares: { data: shares },
  supplyAsset: { data: supplyAsset },
}: {
  shares: QueryProp<Shares>
  supplyAsset: QueryProp<SupplyAsset>
}) => {
  const { value, staked } = shares ?? {}
  const { symbol, depositedAmount } = supplyAsset ?? {}

  const unstaked = maybes([value, staked], ([value, staked]) => decimalMinus(value, staked))
  const unstakedPercentage = maybes([value, unstaked], ([value, unstaked]) =>
    +value ? decimalDiv(unstaked, value) : null,
  )
  const stakedPercentage = maybes([value, staked], ([value, staked]) => (+value ? decimalDiv(staked, value) : null))

  return (
    <TooltipWrapper>
      <TooltipDescription
        text={t`The total amount of the debt token (e.g., crvUSD) you have deposited into this lending market.`}
      />
      <TooltipDescription text={t`This capital is used by borrowers and earns interest and potentially rewards.`} />
      <TooltipDescription text={t`Only staked supplied amounts are elligible for extra CRV rewards.`} />
      <TooltipItems secondary>
        <TooltipItem title={t`Total staked / unstaked`}>
          {`${formatPercentageDisplay(stakedPercentage)} / ${formatPercentageDisplay(unstakedPercentage)}`}
        </TooltipItem>
        <TooltipItem variant="subItem" title={t`Staked`}>
          {formatAmount(stakedPercentage, depositedAmount, symbol) ?? UnavailableNotation}
        </TooltipItem>
        <TooltipItem variant="subItem" title={t`Unstaked`}>
          {formatAmount(unstakedPercentage, depositedAmount, symbol) ?? UnavailableNotation}
        </TooltipItem>
      </TooltipItems>
      <TooltipItem variant="primary" title={t`Total supplied`}>
        {maybes(
          [depositedAmount, symbol],
          ([depositedAmount, symbol]) => `${formatNumber(depositedAmount, { abbreviate: true })} ${symbol}`,
        ) ?? UnavailableNotation}
      </TooltipItem>
    </TooltipWrapper>
  )
}
