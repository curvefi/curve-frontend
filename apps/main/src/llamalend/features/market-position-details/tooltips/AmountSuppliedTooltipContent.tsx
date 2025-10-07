import {
  TooltipWrapper,
  TooltipDescription,
  TooltipItems,
  TooltipItem,
} from '@/llamalend/widgets/tooltips/TooltipComponents'
import { t } from '@ui-kit/lib/i18n'
import { formatNumber, formatPercent } from '@ui-kit/utils'
import type { Shares, SupplyAsset } from '../SupplyPositionDetails'

const UnavailableNotation = '-'

const isAvailable = (value: number | null | undefined): value is number => value != null

const formatAmount = (
  percentage: number | null,
  depositedAmount: number | null | undefined,
  symbol: string | null | undefined,
) => {
  if (percentage === null || !isAvailable(depositedAmount) || !symbol) return null
  return `${formatNumber(percentage * depositedAmount, { abbreviate: true })} ${symbol}`
}

const formatPercentageDisplay = (percentage: number | null) =>
  percentage !== null ? formatPercent(percentage * 100) : UnavailableNotation

export const AmountSuppliedTooltipContent = ({ shares, supplyAsset }: { shares: Shares; supplyAsset: SupplyAsset }) => {
  const { value, staked } = shares

  const unstaked = isAvailable(value) && isAvailable(staked) ? value - staked : null
  const unstakedPercentage = isAvailable(value) && unstaked !== null ? unstaked / value : null
  const stakedPercentage = isAvailable(value) && isAvailable(staked) ? staked / value : null

  const stakedAmount = formatAmount(stakedPercentage, supplyAsset.depositedAmount, supplyAsset.symbol)
  const unstakedAmount = formatAmount(unstakedPercentage, supplyAsset.depositedAmount, supplyAsset.symbol)

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
          {stakedAmount ?? UnavailableNotation}
        </TooltipItem>
        <TooltipItem variant="subItem" title={t`Unstaked`}>
          {unstakedAmount ?? UnavailableNotation}
        </TooltipItem>
      </TooltipItems>
      <TooltipItem variant="primary" title={t`Total supplied`}>
        {isAvailable(supplyAsset.depositedAmount) && supplyAsset.symbol
          ? `${formatNumber(supplyAsset.depositedAmount, { abbreviate: true })} ${supplyAsset.symbol}`
          : UnavailableNotation}
      </TooltipItem>
    </TooltipWrapper>
  )
}
