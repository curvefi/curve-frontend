import { FORMAT_OPTIONS, formatNumber } from '@ui/utils/utilsFormat'
import { Pnl } from '@ui-kit/features/market-position-details/BorrowPositionDetails'
import { t } from '@ui-kit/lib/i18n'
import { TooltipItem, TooltipItems, TooltipWrapper, TooltipDescription } from '@ui-kit/shared/ui/TooltipComponents'

type PnlMetricTooltipContentProps = {
  pnl: Pnl | undefined | null
}

const UnavailableNotation = '-'

export const PnlMetricTooltipContent = ({ pnl }: PnlMetricTooltipContentProps) => (
  <TooltipWrapper>
    <TooltipDescription
      text={t`Profit and Loss (PnL) is calculated based on the value of the collateral at deposits minus the borrow costs and eventual losses if the position was in soft-liquidation.`}
    />
    <TooltipItems secondary>
      <TooltipItem title={t`Collateral value`} variant="independent">
        {pnl?.currentPositionValue
          ? formatNumber(pnl.currentPositionValue, { ...FORMAT_OPTIONS.USD })
          : UnavailableNotation}
      </TooltipItem>

      <TooltipItem title={t`Value at deposit`} variant="independent">
        {pnl?.depositedValue ? formatNumber(pnl.depositedValue, { ...FORMAT_OPTIONS.USD }) : UnavailableNotation}
      </TooltipItem>

      <TooltipItem title={t`Profit/Loss`} variant="independent">
        {pnl?.currentProfit && pnl?.depositedValue && pnl?.currentPositionValue
          ? formatNumber(pnl.currentProfit, { ...FORMAT_OPTIONS.USD })
          : UnavailableNotation}
        {pnl?.percentageChange && `(${formatNumber(pnl.percentageChange, { ...FORMAT_OPTIONS.PERCENT })})`}
      </TooltipItem>
    </TooltipItems>
  </TooltipWrapper>
)
