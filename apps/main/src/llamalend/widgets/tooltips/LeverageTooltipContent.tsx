import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import {
  TooltipDescription,
  TooltipFormula,
  TooltipFraction,
  TooltipItem,
  TooltipItems,
  TooltipWrapper,
} from '@ui/components/TooltipComponents'
import type { QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'

/**
 * A position opened without leverage would show a wrong opening leverage, so it only shows for positions opened with
 * leverage.
 * There is no loading state: it comes from the same collateral events query as the leverage, so the card metric and the
 * table cell only render once that query has loaded.
 */
const getOpeningLeverageNotice = ({ data, error }: QueryProp<Decimal | null>) =>
  error
    ? t`Could not load the opening leverage: ${error.message}`
    : data
      ? undefined
      : t`The opening leverage is only known when the position's first action is a recorded leverage zap.`

export const OpeningLeverageTooltipContent = ({ openingLeverage }: { openingLeverage: QueryProp<Decimal | null> }) => (
  <TooltipWrapper>
    <TooltipDescription
      text={
        getOpeningLeverageNotice(openingLeverage) ??
        t`The position opened at ${formatNumber(openingLeverage.data, 'multiplier')}. Leverage moves with price after that.`
      }
    />
  </TooltipWrapper>
)

export const LeverageTooltipContent = ({ openingLeverage }: { openingLeverage?: QueryProp<Decimal | null> }) => (
  <TooltipWrapper>
    <TooltipDescription
      text={t`Your exposure to the collateral token: your collateral value divided by your equity.`}
    />
    <TooltipDescription
      text={t`It moves with price: it rises when collateral falls and drops when collateral gains.`}
    />
    {maybe(openingLeverage, openingLeverage => (
      <TooltipItems secondary>
        <TooltipItem title={t`Opened at`}>{formatNumber(openingLeverage.data, 'multiplier')}</TooltipItem>
        {maybe(getOpeningLeverageNotice(openingLeverage), notice => (
          <TooltipDescription text={notice} />
        ))}
      </TooltipItems>
    ))}
    <TooltipFormula
      formula={
        <>
          {t`Leverage =`}
          <TooltipFraction numerator={t`C`} denominator={t`C + X − debt`} />
        </>
      }
      terms={[
        { symbol: 'C', label: t`collateral at the oracle price` },
        { symbol: 'X', label: t`collateral converted to the borrowed token during soft liquidation` },
      ]}
    />
  </TooltipWrapper>
)
