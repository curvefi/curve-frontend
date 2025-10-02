import { formatPercent } from '@/llamalend/format.utils'
import {
  TooltipWrapper,
  TooltipDescription,
  TooltipItems,
  TooltipItem,
} from '@/llamalend/widgets/tooltips/TooltipComponents'
import { t } from '@ui-kit/lib/i18n'
import { formatNumber } from '@ui-kit/utils'
import type { Shares, SupplyAsset } from '../SupplyPositionDetails'

const UnavailableNotation = '-'

export const AmountSuppliedTooltipContent = ({ shares, supplyAsset }: { shares: Shares; supplyAsset: SupplyAsset }) => {
  const { value, staked } = shares
  const unstaked = value && staked ? value - staked : null
  const unstakedPercentage = value && unstaked ? unstaked / value : null
  const stakedPercentage = value && staked ? staked / value : null
  const stakedAmount =
    stakedPercentage && supplyAsset.depositedAmount && supplyAsset.symbol
      ? `${formatNumber(stakedPercentage * supplyAsset.depositedAmount, { abbreviate: true })} ${supplyAsset.symbol}`
      : null
  const unstakedAmount =
    unstakedPercentage && supplyAsset.depositedAmount && supplyAsset.symbol
      ? `${formatNumber(unstakedPercentage * supplyAsset.depositedAmount, { abbreviate: true })} ${supplyAsset.symbol}`
      : null

  return (
    <TooltipWrapper>
      <TooltipDescription
        text={t`The total amount of the debt token (e.g., crvUSD) you have deposited into this lending market.`}
      />
      <TooltipDescription text={t`This capital is used by borrowers and earns interest and potentially rewards.`} />
      <TooltipDescription text={t`Only staked supplied amounts are elligible for extra CRV rewards.`} />
      <TooltipItems secondary>
        <TooltipItem
          title={t`Total staked / unstaked`}
        >{`${stakedPercentage ? formatPercent(stakedPercentage * 100) : UnavailableNotation} / ${unstakedPercentage ? formatPercent(unstakedPercentage * 100) : UnavailableNotation}`}</TooltipItem>
        <TooltipItem variant="subItem" title={t`Staked`}>
          {stakedAmount ?? UnavailableNotation}
        </TooltipItem>
        <TooltipItem variant="subItem" title={t`Unstaked`}>
          {unstakedAmount ?? UnavailableNotation}
        </TooltipItem>
      </TooltipItems>
      <TooltipItem variant="primary" title={t`Total supplied`}>
        {supplyAsset.depositedAmount
          ? `${formatNumber(supplyAsset.depositedAmount, { abbreviate: true })} ${supplyAsset.symbol}`
          : UnavailableNotation}
      </TooltipItem>
    </TooltipWrapper>
  )
}
