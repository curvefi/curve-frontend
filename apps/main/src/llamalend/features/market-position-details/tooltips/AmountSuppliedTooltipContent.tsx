import type { UserBalances } from '@/llamalend/queries/user/user-balances.query'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber, UNAVAILABLE_NOTATION } from '@primitives/number.utils'
import { type Nullish, maybe, maybes } from '@primitives/objects.utils'
import {
  TooltipDescription,
  TooltipFooter,
  TooltipItem,
  TooltipItems,
  TooltipWrapper,
} from '@ui/components/TooltipComponents'
import type { QueryProp } from '@ui/features/queries/util'
import { decimalDiv, decimalMinus, decimalMultiply } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { formatToken } from '@ui/lib/tokens'
import type { SupplyAsset } from '../SupplyPositionDetails'

const formatAmount = (percentage: Decimal | Nullish, depositedAmount: Decimal | Nullish, symbol: string | Nullish) =>
  maybes([percentage, depositedAmount, symbol], (percentage, depositedAmount, symbol) =>
    formatToken(decimalMultiply(percentage, depositedAmount), symbol),
  )

const formatPercentageDisplay = (percentage: Decimal | Nullish) =>
  maybe(percentage, p => formatNumber(decimalMultiply(p, '100'), 'percent.rate')) ?? UNAVAILABLE_NOTATION

export const AmountSuppliedTooltipContent = ({
  balances: { data: balances },
  supplyAsset: { data: supplyAsset },
  showUsdValue = false,
}: {
  balances: QueryProp<UserBalances>
  supplyAsset: QueryProp<SupplyAsset>
  showUsdValue?: boolean
}) => {
  const { totalShares: value, gauge: staked } = balances ?? {}
  const { symbol, depositedAmount, depositedUsdValue } = supplyAsset ?? {}

  const unstaked = maybes([value, staked], (value, staked) => decimalMinus(value, staked))
  const unstakedPercentage = maybes([value, unstaked], (value, unstaked) =>
    +value ? decimalDiv(unstaked, value) : null,
  )
  const stakedPercentage = maybes([value, staked], (value, staked) => (+value ? decimalDiv(staked, value) : null))

  if (showUsdValue) {
    return (
      <TooltipWrapper>
        <TooltipDescription
          text={t`Underlying tokens supplied to this market. They earn interest and may qualify for rewards.`}
        />
        <TooltipItems secondary>
          <TooltipItem title={t`Amount supplied`} variant="independent">
            {formatNumber(depositedAmount, 'token.balance')}
            {symbol}
          </TooltipItem>
          <TooltipItem title={t`USD value`} variant="independent">
            {formatNumber(depositedUsdValue, 'usd.notional')}
          </TooltipItem>
        </TooltipItems>
        <TooltipItems>
          {[
            { title: t`Staked`, percentage: stakedPercentage },
            { title: t`Unstaked`, percentage: unstakedPercentage },
          ].map(({ title, percentage }) => (
            <TooltipItem key={title} title={title} variant="independent">
              {formatNumber(maybes([percentage, depositedAmount], decimalMultiply), 'token.balance')}
              {symbol}
              {`(${formatPercentageDisplay(percentage)})`}
            </TooltipItem>
          ))}
        </TooltipItems>
        <TooltipFooter>{t`Only staked supply is eligible for CRV rewards.`}</TooltipFooter>
      </TooltipWrapper>
    )
  }

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
          {formatAmount(stakedPercentage, depositedAmount, symbol) ?? UNAVAILABLE_NOTATION}
        </TooltipItem>
        <TooltipItem variant="subItem" title={t`Unstaked`}>
          {formatAmount(unstakedPercentage, depositedAmount, symbol) ?? UNAVAILABLE_NOTATION}
        </TooltipItem>
      </TooltipItems>
      <TooltipItem variant="primary" title={t`Total supplied`}>
        {maybes([depositedAmount, symbol], (depositedAmount, symbol) => formatToken(depositedAmount, symbol)) ??
          UNAVAILABLE_NOTATION}
      </TooltipItem>
    </TooltipWrapper>
  )
}
